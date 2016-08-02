var express = require('express');
var router = express.Router();

var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');


router.get('/organism/profile', permissions.requireGroup('organism'), function(req,res){
  console.log('Begin get /profile')
  res.json(req.session.organism);
});

module.exports = router;
