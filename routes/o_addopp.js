var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');
var Opp = require('../models/opp_model.js');

router.get('/organism/addopp', permissions.requireGroup('organism'), function(req, res){
  res.render('o_addopp.jade', {organism: req.isAuthenticated()});
});

router.post('/organism/addopp', permissions.requireGroup('organism'), function(req,res){
  //Transform address into lon/lat
  console.log('address sent to gmaps: ' + req.body.address)

  gmaps.codeAddress(req.body.address, function(lat, lon){
    var opp = new Opp({
      intitule: req.body.intitule,
      orgName: req.user.orgName,
      nbBenevoles: req.body.nbBenevoles,
      address: req.body.address,
      date: req.body.date,
      lat: lat,
      lon: lon,
      mail: req.user.email
    });
    opp.save(function(err){
      if(err){
          var error = 'Something bad happened! Try again!';
          res.render('o_addopp.jade', {error: err, organism: req.isAuthenticated()})
      }
      else{
          res.redirect('/organism/dashboard');
      }
    });
  });
});

module.exports = router;
