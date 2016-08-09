/*jslint node: true */

var express = require('express');
var router = express.Router();


var permissions = require('../middlewares/permissions.js');



router.get('/volunteer/profile', permissions.requireGroup('volunteer'), function(req,res){
	console.log('Begin get /profile')
	console.log(req.session.volunteer);
	res.render('v_profile.jade', {opps: req.session.volunteer.events, volunteer: req.session.volunteer});
});

router.post('/volunteer/editPassword', function(req, res) {
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
