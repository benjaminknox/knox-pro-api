var _ = require('lodash');
var express = require('express');
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : process.env['MYSQL_HOST'],
    user     : process.env['MYSQL_USERNAME'],
    password : process.env['MYSQL_PASSWORD'],
    database : process.env['MYSQL_DATABASE'],
    charset  : process.env['MYSQL_ENCODING']
  }
});
var bookshelf = require('bookshelf')(knex);
var router = express.Router();
var pageSize = 10;
var Articles = bookshelf.Model.extend({
  tableName: 'articles'
});

bookshelf.plugin('pagination');

function returnObject(data, type, forceArray) {
  var records = {
    type: type
  };
  
  if(data.pagination) {
    records.count = data.pagination.rowCount;
    records.pageCount = data.pagination.pageCount;
  } else {
    records.count = data.length || 1;
    records.pageCount = 1;
  }
  
  if(records.count > 1 || forceArray) {
    records.records = data;
  } else { 
    records.record = data;
  }
  
  return records;
}

router.get('/articles/last', function() {
  Articles.fetchOne().orderBy('created_date', 'DESC')
    .then(function(data){
      if(data) {
        res.send(data);
      } else {
        res.status(404).send(data);
      }
    })
    .catch(function(error) {
      res.status(500).send(error);
    });
});

router.get('/articles/categories', function(req, res, next) {
  Articles.where({'active': 1})
    .fetchAll()
    .then(function(articles){
      var keys;
      if(articles) {
        keys = Object.keys(articles.groupBy('category'));
        res.send(returnObject(keys, 'categories'));
      } else {
        res.status(404).send(data);
      }
    })
    .catch(function(error) {
      res.status(500).send(error);
    });
});

router.get('/articles/category/:category', function(req, res, next) {
  var query = Articles.where({
      'active': 1,
      'category': req.params.category
    }
  ).orderBy('created_date', 'DESC');

  if(req.query.page) {
    query = query.fetchPage({
      page: req.query.page,
      pageSize: req.query.pageSize || pageSize
    });
  } else {
    query = query.fetchAll();
  }
  
  query
    .then(function(data){
      if(data) {
        res.send(returnObject(data, 'article', true));
      } else {
        res.status(404).send(data);
      }
    })
    .catch(function(error) {
      res.status(500).send(error);
    });
});

router.get('/articles/:id?', function(req, res, next) {
  var forceArray = false,
      query = Articles.where({'active': 1});
  
  if(req.params.id) {
    query = query.where({ 'id': req.params.id }).fetch();
  } else {
    forceArray = true;
    query = query.orderBy('created_date', 'DESC');
    
    if(req.query.page) {
     query = query.fetchPage({
       page: req.query.page,
       pageSize: req.query.pageSize || pageSize
     });
    } else {
      query = query.fetchAll();
    }
  }

  query
    .then(function(data){
      if(data) {
        res.send(returnObject(data, 'article', forceArray));
      } else {
        res.status(404).send(data);
      }
    })
    .catch(function(error) {
      res.status(500).send(error);
    });
});

module.exports = router;
