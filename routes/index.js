var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var stormpathGroupsRequired = require('../middlewares/stormpathGroupsRequired').stormpathGroupsRequired;


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Opp = require('../models/opp_model.js');
var Organism = require('../models/organism_model.js');

var app = express();


/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('http://platform.simplyk.org');
});

/* GET home page. */
router.get('/user', stormpath.getUser, function(req, res, next) {
	res.json(req.user);
});

router.get('/customData', stormpath.getUser, stormpath.loginRequired, function(req, res, next) {
	var customData = req.user.customData;
	res.json(customData);
});

/*GET dashboard page*/
router.get('/dashboard', stormpath.getUser, stormpath.loginRequired, function(req, res){
	Opp.find({oName: req.user.customData.oname}, function(err, opps){
		if(err){
			console.log(err);
			res.render('dashboard.jade', {session: req.session});
		}
		//Create opps list
		else{
			res.render('dashboard.jade', {opps: opps, session: req.session});
		}
	})
});

router.get('/profile', stormpath.getUser, stormpath.loginRequired, function(req,res){
	console.log(req.user.customData);
	res.render('profile.jade', {session: req.session, favs: req.user.customData.favopps});
});

router.get('/addopp', /*stormpath.groupsRequired(['organism'], false),*/ function(req, res){
	res.render('addopp.jade');
});

router.post('/addopp', stormpath.getUser, function(req,res){
	Organism.findOne({'id': req.user.customData.id}, 'name', function(err, organism){
		if (err){
			res.render('addopp.jade', {error: err})
		}
		else{
			var opp = new Opp({
				intitule: req.body.intitule,
				oName: organism.name,
				nbBenevoles: req.body.nbBenevoles,
				adress: req.body.address,
				date: req.body.date,
				lat: req.body.lat,
				lon: req.body.lon,
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
			})
		}
	})
});


module.exports = router;