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
	//VARIABLES
	let find = {};
	let update = {
		'$set': {}
	};
	let type = {};
	let new_object = {};
	let path_to_new_object = {};
	let path_to_new_object2 = {};
	let send = {};
	let update_intercom = {};
	let intercom_custom = {};
	let intercom_main = {};
	let new_value = {};
	let ok = true;
	update_intercom.update_last_request_at = true;
	update_intercom.custom_attributes = {};

	if (req.session.group == 'volunteer') {
		find._id = req.session.volunteer._id;
		update_intercom.user_id = req.session.volunteer._id;
		if (typeof req.body.phone != 'undefined') {
			type = 'phone';
			new_object = 'newPhone';
			update.$set = {
				phone: req.body.phone
			};
			intercom_main = 'phone';
			path_to_new_object = type;
		} else if (typeof req.body.school_name != 'undefined') {
			type = 'school_name';
			new_object = 'newSchool';
			update.$set = {
				'admin.school_name': req.body.school_name
			};
			intercom_custom = 'school_name';
			path_to_new_object = 'admin';
			path_to_new_object2 = 'school_name';
		} else {
			let err = 'Aucune donnée envoyée au serveur. Essaies de modifier à nouveau ton profil, sinon contacte nous à l\'adresse francois@simplyk.org :)'
			console.error(err);
			res.status(404).send({
				error: err
			});
		};
		console.log('A volunteer (' + req.session.volunteer.email + ') is changing his ' + type + ' to ' + req.body[type]);
		console.log('req.body.' + type + ' : ' + req.body[type]);
		Volunteer.findOneAndUpdate(find, update, {
				new: true
			},
			function(err, newVolunteer) {
				if (err) {
					console.error(err);
					res.status(404).send({
						error: err
					});
				} else {
					if (path_to_new_object2.length > 0) {
						new_value = newVolunteer[path_to_new_object][path_to_new_object2];
					} else {
						new_value = newVolunteer[path_to_new_object];
					};

					send[new_object] = new_value;

					if (intercom_custom.length > 0) {
						update_intercom.custom_attributes[intercom_custom] = new_value;
					};
					if (intercom_main.length > 0) {
						update_intercom[intercom_main] = new_value;
					}

					console.info('Volunteer ' + type + ' updated ' + new_value);

					req.session.volunteer = newVolunteer;
					res.status(200).send(send);
					client.users.update(update_intercom);
				}
			});
	} else if (req.session.group == 'organism') {
		find._id = req.session.organism._id;
		update_intercom.user_id = req.session.organism._id;
		if (typeof req.body.phone != 'undefined') {
			type = 'phone';
			new_object = 'newPhone';
			update.$set = {
				phone: req.body.phone
			};
			intercom_main = 'phone';
			path_to_new_object = type;
		} else if (typeof req.body.email != 'undefined') {
			type = 'email';
			new_object = 'newEmail';
			update.$set = {
				email: req.body.email
			};
			intercom_main = 'email';
			path_to_new_object = type;
		} else if (typeof req.body.website != 'undefined') {
			type = 'website';
			new_object = 'newWebsite';
			update.$set = {
				website: req.body.website
			};
			intercom_custom = 'website';
			path_to_new_object = type;
		} else if (typeof req.body.cause != 'undefined') {
			type = 'cause';
			new_object = 'newCause';
			update.$set = {
				cause: req.body.cause
			};
			intercom_custom = 'cause';
			path_to_new_object = type;
		} else if (typeof req.body.description != 'undefined') {
			type = 'description';
			new_object = 'newDescription';
			update.$set = {
				description: req.body.description
			};
			intercom_custom = 'description';
			path_to_new_object = type;
		} else if (typeof req.body.firstname != 'undefined') {
			console.log(req.body.lastname);
			type = 'name';
			new_object = 'newName';
			update.$set = {
				firstname: req.body.firstname,
				lastname: req.body.lastname
			};
			intercom_custom = 'description';
			path_to_new_object = type;
		} else {
			let err = 'Aucune donnée envoyée au serveur. Essaies de modifier à nouveau ton profil, sinon contacte nous à l\'adresse francois@simplyk.org :)'
			console.error(err);
			ok = false;
			res.status(404).send({
				error: err
			});
		};
		if (ok) {
			Organism.findOneAndUpdate(find, update, {
					new: true
				},
				function(err, newOrganism) {
					if (err) {
						console.error(err);
						res.status(404).send({
							error: err
						});
					} else {
						if (path_to_new_object2.length > 0) {
							new_value = newOrganism[path_to_new_object][path_to_new_object2];
						} else if (typeof req.body.firstname != 'undefined') {
							new_value = newOrganism.firstname + ' ' + newOrganism.lastname;
						} else {
							new_value = newOrganism[path_to_new_object];
						};
						send[new_object] = new_value;
						if (intercom_custom.length > 0) {
							update_intercom.custom_attributes[intercom_custom] = new_value;
						};
						if (intercom_main.length > 0) {
							update_intercom[intercom_main] = new_value;
						}
						console.info('Organism ' + type + ' updated ' + new_value);
						req.session.organism = newOrganism;
						res.status(200).send(send);
						client.users.update(update_intercom);
					}
				});
		}
	} else {
		let err = 'Aucune donnée envoyée au serveur. Essaies de modifier à nouveau ton profil, sinon contacte nous à l\'adresse francois@simplyk.org :)'
		console.error(err);
		res.status(404).send({
			error: err
		});
	}
})

module.exports = router;