var ig = require('instagram-node').instagram();
var express = require('express');
var router = express.Router();

ig.use({access_token: process.env['INSTAGRAM_TOKEN']});

/* GET home page. */
router.get('/instagram', function(req, res, next) {
  var count = 10,
      options = { count: req.params.pageSize || count };
  
  ig.user_self_media_recent(options, function(err, medias){
    res.send(medias);
  });
});

module.exports = router;
