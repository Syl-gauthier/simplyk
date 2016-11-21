'use strict';
const express = require('express');
const router = express.Router();
const Intercom = require('intercom-client');
const client = new Intercom.Client({
	token: process.env.INTERCOM_TOKEN
});

const permissions = require('../middlewares/permissions.js');
const Volunteer = require('../models/volunteer_model.js');
const Organism = require('../models/organism_model.js');

router.post('*/edit-profile', permissions.requireGroup('volunteer', 'organism'), function(req, res) {
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
					client.users.update({
						user_id: req.session.volunteer._id,
						phone: newVolunteer.phone,
						update_last_request_at: true
					});
				}
			});
		} else if (typeof req.body.school_name != 'undefined') {
			console.log('A volunteer (' + req.session.volunteer.email + ') is changing his phone to ' + req.body.school_name);
			console.log('req.body.school_name : ' + req.body.school_name);
			Volunteer.findOneAndUpdate({
				'_id': req.session.volunteer._id
			}, {
				'$set': {
					'admin.school_name': req.body.school_name
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
					console.info('Volunteer school_name updated ' + newVolunteer.school_name);
					req.session.volunteer = newVolunteer;
					res.status(200).send({
						newSchool: newVolunteer.admin.school_name
					});
					client.users.update({
						user_id: req.session.volunteer._id,
						update_last_request_at: true,
						custom_attributes: {
							school_name: newVolunteer.admin.school_name
						}
					});
				}
			});
		}
	} else if (req.session.group == 'organism') {
		if (typeof req.body.phone != 'undefined') {
			console.log('An organism (' + req.session.organism.email + ') is changing his phone to ' + req.body.phone);
			console.log('req.body.phone : ' + req.body.phone);
			Organism.findOneAndUpdate({
				'_id': req.session.organism._id
			}, {
				'$set': {
					'phone': req.body.phone
				}
			}, {
				new: true
			}, function(err, newOrganism) {
				if (err) {
					console.error(err);
					res.status(404).send({
						error: err
					});
				} else {
					console.info('Organism phone updated ' + newOrganism.phone);
					req.session.organism = newOrganism;
					res.status(200).send({
						newPhone: newOrganism.phone
					});
					client.users.update({
						user_id: req.session.organism._id,
						phone: newOrganism.phone,
						update_last_request_at: true
					});
				}
			});
		} else if (typeof req.body.email != 'undefined') {
			console.log('An organism (' + req.session.organism.email + ') is changing his email to ' + req.body.email);
			console.log('req.body.email : ' + req.body.email);
			let alreadyExists = false;

			Organism.findOneAndUpdate({
				'_id': req.session.organism._id
			}, {
				'$set': {
					'email': req.body.email
				}
			}, {
				new: true
			}, function(err, newOrganism) {
				if (err) {
					console.error(err);
					res.status(404).send({
						error: err
					});
				} else {
					console.info('Organism email updated ' + newOrganism.email);
					req.session.organism = newOrganism;
					res.status(200).send({
						newEmail: newOrganism.email
					});
					client.users.update({
						user_id: req.session.organism._id,
						email: newOrganism.email,
						update_last_request_at: true
					});
				}
			});
		}
	}
})

module.exports = router;