var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/bible/daily_verse', function(req, res, next) {
  request('http://www.esvapi.org/v2/rest/verse?&key=' + process.env['ESV_API_TOKEN'],
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send({
          html: body
        });
      } else {
        res.send(error);
      }
    }
  );
});

module.exports = router;
