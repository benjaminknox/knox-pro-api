var _ = require('lodash');
var express = require('express');
var router = express.Router();
var request = require('request');

var async = require('async');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var cheerio = require('cheerio');

var url = 'mongodb://localhost:27017';

router.head('/emails/webhook', function (req, res) {
  console.log('Received head request from webhook.');
  res.send(200);
});

router.get('/emails/devotionals',function(req, res) {
  MongoClient.connect(url + '/articles', function(err, db) {
    var articles = [],
        cursor;

    assert.equal(null, err);
    db.collection('dans',
      function(err, collection) {
        collection
          .find()
          .toArray(function(err, docs) {
            res.send({
              'type': 'devotional',
              'count': docs.length,
              'records': docs
            });
            db.close();
          });
      }
    );
  });
});

router.post('/emails/webhook', function (req, res) {
  console.log('Receiving webhook.');

  /* Parse the multipart form. The attachments are parsed into fields and can
   * be huge, so set the maxFieldsSize accordingly. */
  var form = new multiparty.Form({
    maxFieldsSize: 70000000
  });

  form.on('progress', function () {
    var start = Date.now();
    var lastDisplayedPercentage = -1;
    return function (bytesReceived, bytesExpected) {
      var elapsed = Date.now() - start;
      var percentage = Math.floor(bytesReceived / bytesExpected * 100);
      if (percentage % 20 === 0 && percentage !== lastDisplayedPercentage) {
        lastDisplayedPercentage = percentage;
        console.log('Form upload progress ' +
        percentage + '% of ' + bytesExpected / 1000000 + 'Mb. ' + elapsed + 'ms');
      }
    };
  }());

  form.parse(req, function (err, fields) {
    var email = JSON.parse(fields.mailinMsg);
        
    MongoClient.connect(url + '/emails', function(err, db) {
      assert.equal(null, err);
      db.collection('emails').insertOne(email);
      db.close();
    });
    
    MongoClient.connect(url + '/articles', function(err, db) {
      assert.equal(null, err);
      if(_.find(email.envelopeTo, {address: 'dan@knox.pro'})) {
        var article = cheerio.load(email.html)('body').text().trim().split('\r\n');
        var title = article.shift().trim(); 
        var message = article.join('\r\n');
        
        db.collection('dans')
          .insertOne({
            title: title,
            body: message,
            created_date: Date.now()
          });
      }
      db.close();
    });
  });
});

module.exports = router;
