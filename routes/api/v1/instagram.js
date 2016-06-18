var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/instagram', function(req, res, next) {
  res.send({
    'api': 'Will give me my instagram posts'
  });
});

module.exports = router;
