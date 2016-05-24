var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var GoogleMapsAPI = require('googlemaps');
var stormpathGroupsRequired = require('../middlewares/stormpathGroupsRequired').stormpathGroupsRequired;
var jade = require('jade');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Opp = require('../models/opp_model.js');
var User = require('../models/user_model.js');

var app = express();


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('accueil.jade');
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
	console.log(req.user.customData);

	Opp.find({oName: req.user.customData.name}, function(err, opps){
		if(err){
			console.log(err);
			res.render('dashboard.jade', {session: req.session, error: err});
		}
		//Create opps list
		else{
			console.log(opps.toString());
			res.render('dashboard.jade', {opps: opps, session: req.session});
		}
	});
});

//for ajax call only (for now)
//Get users info from an opp intitule
router.post('/getOppUsers', function(req, res){
	console.log("opp_id: " + req.body.opp_id);

	Opp.findById(req.body.opp_id).populate("applications.applicant").exec(function(err, opp){
		if(err){
			console.log(err);
			res.write(err);
			res.end();
		}
		else{
      console.log(opp.toString());
      res.render('applicants.jade', {applications: opp.applications});
		}
	});
});

module.exports = router;
