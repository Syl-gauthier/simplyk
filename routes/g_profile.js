var express = require('express');
var router = express.Router();
var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Admin = require('../models/admin_model.js');
var bcrypt = require('bcrypt');

router.post('/editPassword', function(req, res) {
  console.log('Dans editpassword');
  //Contains current, new and confirm password
  var passwords = req.body;
  if (req.session.volunteer) {
    //Check for validity of password and coherence between new and confirm
    if (!bcrypt.compareSync(passwords.current, req.session.volunteer.password) || passwords.new != passwords.confirm) {
      console.log('No coherence');
      res.send({
        success: false,
        err: "No coherence between new and old password"
      });
    } else {
      console.log('About to change password');
      req.session.volunteer.password = bcrypt.hashSync(passwords.new, bcrypt.genSaltSync(10), null);
      Volunteer.findOneAndUpdate({
        "_id": req.session.volunteer._id
      }, {
        "password": req.session.volunteer.password
      }, function(err) {
        console.log('Password updated with success ! ')
        res.send({
          success: true
        });
      });
    }
  } else if (req.session.organism) {
    //Check for validity of password and coherence between new and confirm
    if (!bcrypt.compareSync(passwords.current, req.session.organism.password) || passwords.new != passwords.confirm) {
      console.log('No coherence');
      res.send({
        success: false,
        err: "No coherence between new and old password"
      });
    } else {
      console.log('About to change password');
      req.session.organism.password = bcrypt.hashSync(passwords.new, bcrypt.genSaltSync(10), null);
      Organism.findOneAndUpdate({
        "_id": req.session.organism._id
      }, {
        "password": req.session.organism.password
      }, function(err) {
        console.log('Password updated with success ! ')
        res.send({
          success: true
        });
      });
    }
  } else if (req.session.admin) {
    //Check for validity of password and coherence between new and confirm
    if (!bcrypt.compareSync(passwords.current, req.session.admin.password) || passwords.new != passwords.confirm) {
      console.log('No coherence');
      res.send({
        success: false,
        err: "No coherence between new and old password"
      });
    } else {
      console.log('About to change password');
      req.session.admin.password = bcrypt.hashSync(passwords.new, bcrypt.genSaltSync(10), null);
      Admin.findOneAndUpdate({
        "_id": req.session.admin._id
      }, {
        "password": req.session.admin.password
      }, function(err) {
        console.log('Password updated with success ! ')
        res.send({
          success: true
        });
      });
    }
  } else {
    res.send({
      success: false,
      err: "No user found"
    });
  };
});

module.exports = router;