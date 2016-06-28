var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');

var Organism = require('../models/organism_model.js');
var Opp = require('../models/opp_model.js');

router.get('/', function(req, res){
  res.render('addopp.jade');
});

router.post('/', function(req,res){
  //Transform address into lon/lat
  console.log('address sent to gmaps: ' + req.body.address)

  gmaps.codeAddress(req.body.address, function(lat, lon){
    var opp = new Opp({
      intitule: req.body.intitule,
      oName: req.user.orgName,
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
          res.render('addopp.jade', {error: err})
      }
      else{
          res.redirect('/dashboard');
      }
    });
  });
});

module.exports = router;
