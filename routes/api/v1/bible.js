var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/bible/daily_verse', function(req, res, next) {
  request('http://www.esvapi.org/v2/rest/verse?&seed=7107&key=' + process.env['ESV_API_TOKEN'],
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send({
          verseHtml: body
        });
      } else {
        res.send(error);
      }
    }
  );
});

module.exports = router;
