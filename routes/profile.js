var express = require('express');
var router = express.Router();

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
      console.log(req.user.toJSON());
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

router.post('/editPassword', function(req, res){
  //Contains current, new and confirm password
  var passwords = req.body;

  //Check for validity of password and coherence between new and confirm
  if(!req.user.validPassword(passwords.current) || passwords.new != passwords.confirm){
    res.send({success: false, err: "blabla"});
  }
  else{
    req.user.password = req.user.generateHash(passwords.new);
    req.user.save(function(err){
      res.send({success: true});
    });
  }
});

module.exports = router;
