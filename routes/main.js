let express = require('express');
let router = new express.Router();

router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/piano', function(req, res, next) {
    res.render('piano');
});
  
module.exports = router;