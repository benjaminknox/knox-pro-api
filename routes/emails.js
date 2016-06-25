var express = require('express');
var router = express.Router();
var request = require('request');

var async = require('async');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');

router.head('/webhook', function (req, res) {
  console.log('Received head request from webhook.');
  res.send(200);
});

router.post('/webhook', function (req, res) {
  console.log('Receiving webhook.');

  /* Respond early to avoid timouting the mailin server. */
  // res.send(200);

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
    console.log(util.inspect(fields.mailinMsg, {
      depth: 5
    }));

    // var Email = bookshelf.Model.extend({
    //   tableName: 'emails', debugger: true
    // });
    //
    // var email = new Email(flatten(rawEmail, {delimiter: '_', overwrite: true}));

    console.log('Parsed fields: ' + Object.keys(fields));

    /* Write down the payload for ulterior inspection. */
    async.auto({
      writeParsedMessage: function (cbAuto) {
        fs.writeFile('payload.json', fields.mailinMsg, cbAuto);
      },
      writeAttachments: function (cbAuto) {
        var msg = JSON.parse(fields.mailinMsg);
        async.eachLimit(msg.attachments, 3, function (attachment, cbEach) {
          fs.writeFile(attachment.generatedFileName, fields[attachment.generatedFileName], 'base64', cbEach);
        }, cbAuto);
      }
    }, function (err) {
      if (err) {
        console.log(err.stack);
        res.send(500, 'Unable to write payload');
      } else {
        console.log('Webhook payload written.');
        res.send(200);
      }
    });
  });
});

module.exports = router;
