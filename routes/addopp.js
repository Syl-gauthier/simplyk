var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');


var Organism = require('../models/organism_model.js');
var Opp = require('../models/opp_model.js');


router.get('/', stormpath.getUser, function(req, res){
	res.render('addopp.jade');
});

router.post('/', stormpath.getUser, function(req,res){
	//Transform address into lon/lat
	console.log('address sent to gmaps: ' + req.body.address)
	Organism.findOne({'_id': req.user.customData.id}, 'name', function(err, organism){
		if (err){
			res.render('addopp.jade', {error: err})
		}
		else{
			gmaps.codeAddress(req.body.address, function(lat, lon){
				var opp = new Opp({
					intitule: req.body.intitule,
					oName: organism.name,
					nbBenevoles: req.body.nbBenevoles,
					adress: req.body.address,
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
		}
	});
});

module.exports = router;