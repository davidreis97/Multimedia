let express = require('express');
let router = new express.Router();
fileSystem = require('fs'),
path = require('path');

router.get('/', function(req, res, next) {
    res.render('home');
});

router.get('/app', function(req, res, next) {
    res.render('index');
});

router.get('/exporting', function(req, res, next) {
    res.render('exporting');
});

router.get('/tutorial', function(req, res, next) {
    res.render('tutorial');
});

router.get('/about', function(req, res, next) {
    res.render('about');
});

router.get('/inst', function(req, res, next) {
    req.query.id = req.query.id.replace(/\.\./gi,"");
    req.query.id = req.query.id.replace(/\/\//gi,"");
    req.query.id = req.query.id.replace(/\~/gi,"");
    res.download(__dirname + "/../inst/" + req.query.id, );
});
  
module.exports = router;