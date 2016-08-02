var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');

router.get('/organism/addopp', permissions.requireGroup('organism'), function(req, res){
  res.render('o_addopp.jade', {organism: req.isAuthenticated()});
});

router.post('/organism/addopp', permissions.requireGroup('organism'), function(req,res){
  //Transform address into lon/lat
  console.log('address sent to gmaps: ' + req.body.address)

  gmaps.codeAddress(req.body.address, function(lat, lon){
    Organism.findById(req.session.organism._id, function(err, organism){
      console.log('Organism : ' + organism);
      var event = {
        intitule: req.body.intitule,
        activities: [{
          vol_nb: req.body.nbBenevoles,
        }],
        address: req.body.address,
        dates: req.body.date,
        lat: lat,
        lon: lon
      };
      organism.events.push(event);
      organism.save(function(err){
        if(err){
            var error = 'Something bad happened! Try again!';
            res.render('o_addopp.jade', {error: err, organism: req.isAuthenticated()})
        }
        else{
            req.session.organism.events.push(event);
            res.redirect('/organism/dashboard');
        }
      });
    })
  });
});

module.exports = router;
