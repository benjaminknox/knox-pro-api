var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/bible', function(req, res, next) {
  res.send({
    'api': 'Will give me bible verses'
  });
});

module.exports = router;
