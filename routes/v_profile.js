var express = require('express');
var router = express.Router();

var permissions = require('../middlewares/permissions.js');
var Opp = require('../models/opp_model.js');

router.get('/volunteer/profile', permissions.requireGroup('volunteer'), function(req,res){
	console.log('Begin get /profile')
	Opp.find({applications: {$elemMatch: { applicant: req.user._id}}}, function(err, opps){
		if(err){
			console.log(err);
			res.render('v_profile.jade', {session: req.session, error: err});
		}
		//Create opps list
		else{
			console.log(req.session.volunteer);
			res.render('v_profile.jade', {opps: opps, volunteer: req.session.volunteer});
		}
	});
});


module.exports = router;
