var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var stormpathGroupsRequired = require('../middlewares/stormpathGroupsRequired').stormpathGroupsRequired;

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Opp = require('../models/opp_model.js');

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
	Opp.find({oName: req.user.customData.name}, function(err, opps){
		if(err){
			console.log(err);
			res.render('dashboard.jade', {session: req.session, error: err});
		}
		//Create opps list
		else{
			res.render('dashboard.jade', {opps: opps, session: req.session});
		}
	});
});


module.exports = router;