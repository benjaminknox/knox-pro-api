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

router.get('/articles/:id?', function(req, res, next) {
  var Articles = bookshelf.Model.extend({
        tableName: 'articles'
      }),
      query;
  
  if(req.params.id) {
    query = Articles.where({'id': req.params.id}).fetch();
  } else {
    query = Articles.collection().fetch();
  }

  query
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

module.exports = router;
