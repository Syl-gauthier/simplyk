'use strict';
var express = require('express');
var router = express.Router();

var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');

router.post('*/edit-phone', permissions.requireGroup('volunteer', 'organism'), function(req, res) {
	console.info('IN edit-form');
	if (req.session.group == 'volunteer') {
		if (typeof req.body.phone != 'undefined') {
			console.log('A volunteer (' + req.session.volunteer.email + ') is changing his phone to ' + req.body.phone);
			console.log('req.body.phone : ' + req.body.phone);
			Volunteer.findOneAndUpdate({
				'_id': req.session.volunteer._id
			}, {
				'$set': {
					'phone': req.body.phone
				}
			}, {
				new: true
			}, function(err, newVolunteer) {
				if (err) {
					console.error(err);
					res.status(404).send({
						error: err
					});

				} else {
					console.info('Volunteer phone updated ' + newVolunteer.phone);
					req.session.volunteer = newVolunteer;
					res.status(200).send({
						newPhone: newVolunteer.phone
					});
				}
			})
		}
	} else if (req.session.group == 'organism') {

	}
})

module.exports = router;