var express = require('express');
var router = express.Router();

var permissions = require('../middlewares/permissions.js');
var User = require('../models/user_model.js');
var Opp = require('../models/opp_model.js');


router.get('/organism/profile', permissions.requireGroup('organism'), function(req,res){
  console.log('Begin get /profile')
  res.json(req.session.organism);
});

module.exports = router;
