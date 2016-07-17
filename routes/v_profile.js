/*jslint node: true */

var express = require('express');
var router = express.Router();


var permissions = require('../middlewares/permissions.js');
var Opp = require('../models/opp_model.js');


router.get('/volunteer/profile', permissions.requireGroup('volunteer'), function(req, res) {

  console.log('Begin get /profile');

  Opp.find({
    applications: {
      $elemMatch: {
        applicant: req.user._id
      }
    }
  }, function(err, opps) {
    if (err) {
      console.log(err);
      res.render('v_profile.jade', {
        session: req.session,
        error: err
      });
    } else {

      console.log('-----------');
      console.log('volunteer : ');
      console.log(req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname);
      console.log('-----------');

      res.render('v_profile.jade', {
        opps: opps,
        volunteer: req.session.volunteer
      });

    }
  });
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
