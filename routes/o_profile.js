var express = require('express');
var router = express.Router();

var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');


router.get('/organism/profile', permissions.requireGroup('organism'), function(req,res){
  console.log('Begin get /profile');
  res.render('o_profile.jade', {organism: req.session.organism, session: req.session});
});

router.post('/organism/editPassword', function(req, res) {
  //Contains current, new and confirm password
  var passwords = req.body;

  //Check for validity of password and coherence between new and confirm
  if (!req.user.validPassword(passwords.current) || passwords.new != passwords.confirm) {
    res.send({
      success: false,
      err: "blabla"
    });
  } else {
    req.user.password = req.user.generateHash(passwords.new);
    req.user.save(function(err) {
      res.send({
        success: true
      });
    });
  }
});

module.exports = router;
