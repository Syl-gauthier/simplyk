var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');


var Organism = require('../models/organism_model.js');
var Opp = require('../models/opp_model.js');


router.get('/', stormpath.getUser, stormpath.loginRequired, function(req,res){
	console.log(req.user.customData);
	res.render('profile.jade', {session: req.session, favs: req.user.customData.favopps});
});

module.exports = router;