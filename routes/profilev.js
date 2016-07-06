var express = require('express');
var router = express.Router();


var Opp = require('../models/opp_model.js');


router.get('/volunteer/profile', function(req,res){
	console.log('Begin get /profile')
	Opp.find({applications: {$elemMatch: { applicant: req.user._id}}}, function(err, opps){
		if(err){
			console.log(err);
			res.render('profile_volunteer.jade', {session: req.session, error: err});
		}
		//Create opps list
		else{
			console.log(req.session.volunteer);
			res.render('profile_volunteer.jade', {opps: opps, volunteer: req.session.volunteer});
		}
	});
});

module.exports = router;