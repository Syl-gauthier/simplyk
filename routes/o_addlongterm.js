var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');

var permissions = require('../middlewares/permissions.js');


router.get('/organism/addlongterm', permissions.requireGroup('organism'), function(req, res){
  res.render('o_addlongterm.jade', {organism: req.session.organism});
});


module.exports = router;