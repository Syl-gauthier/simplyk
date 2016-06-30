var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');

var User = require('../models/user_model.js');
var Opp = require('../models/opp_model.js');


router.get('/profile', function(req,res){
  console.log(req.user);
    
  User.findById(req.user._id).populate('opportunities.opp').exec(function(err, volunteer){
    if(req.session.group == "volunteer"){
      console.log('Build profile');
      console.log(volunteer.opportunities);

      opps = [];
      volunteer.opportunities.forEach(function(item){ 
        opps.push(item.opp)
      });
        
      console.log(opps);
      res.render('profile_volunteer.jade', {
        user: req.user, 
        opportunities: opps
      });
    }
    else if(req.session.group == "organism"){
      //TO IMPLEMENT
    }
  });
});

module.exports = router;
