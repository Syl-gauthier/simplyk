'use strict';
const express = require('express');
const router = express.Router();
const Intercom = require('intercom-client');
const client = new Intercom.Client({
	token: process.env.INTERCOM_TOKEN
});
const mongoose = require('mongoose');
const getClientSchools = require('../lib/ressources/client_school_list.js').getClientSchools;

const permissions = require('../middlewares/permissions.js');
const Volunteer = require('../models/volunteer_model.js');
const Organism = require('../models/organism_model.js');
const Admin = require('../models/admin_model.js');
const Activity = require('../models/activity_model.js');

router.post('*/edit-profile', permissions.requireGroup('volunteer', 'organism'), function(req, res, next) {
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

	const updateVolunteer = function(type, new_object, intercom_custom, path_to_new_object, path_to_new_object2, update_intercom, new_value, find, update, callback) {
		console.log('A volunteer (' + req.session.volunteer.email + ') is changing his ' + type + ' to ' + req.body[type]);
		console.log('req.body.' + type + ' : ' + req.body[type]);
		console.log('req.body : ' + JSON.stringify(req.body));
		console.log('update : ' + JSON.stringify(update));
		Volunteer.findOneAndUpdate(find, update, {
			new: true
		}, function(err, newVolunteer) {
			if (err) {
				err.type = 'MINOR';
				next(err);
				console.error(err);
				return callback(err, null);
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

				//If school, we have to add student to the admin account
				if (type == 'school_name') {
					console.info('Add student to admins');
					let admins_update = {};
					if (req.body.classe) {
						console.info('There is a class');
						admins_update = {
							'name': req.body.school_name,
							'classes': req.body.classe
						};
					} else {
						console.info('There is no class');
						admins_update = {
							'name': req.body.school_name,
							'type': 'school-coordinator'
						};
					}
					Admin.update(admins_update, {
						'$push': {
							'students': {
								'_id': newVolunteer._id,
								'status': 'automatic_subscription'
							}
						}
					}, {
						multi: true
					}, function(err, admins_updated) {
						if (err) {
							err.type = 'MINOR';
							next(err);
							console.error(err);
							return callback(err, null);
						} else {
							console.info('admins_updated : ' + JSON.stringify(admins_updated));
							client.users.update(update_intercom);
							return callback(null, send);
						}
					});
				} else {
					client.users.update(update_intercom);
					return callback(null, send);
				}
			}
		});
	}

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

			updateVolunteer(type, new_object, intercom_custom, path_to_new_object, path_to_new_object2, update_intercom, new_value, find, update, function(err, send) {
				if (err) {
					err.type = 'MINOR';
					next(err);
					res.status(404).send({
						error: err
					});
				} else {
					res.status(200).send(send);
				}
			});

		} else if (typeof req.body.school_name != 'undefined') {
			getClientSchools(function(err, clients) {
				if (err) {
					err.type = 'MINOR';
					next(err);
					console.error(err);
				}
				let school_id = {};
				type = 'school_name';
				update = {
					'admin.school_name': req.body.school_name,
					student: true
				};

				console.log('clients : ' + JSON.stringify(clients));

				//If school_name is a client school, find the school_id
				console.info('req.body.school_name : ' + req.body.school_name);
				console.info('clients.indexOf(req.body.school_name) : ' + (clients.indexOf(req.body.school_name)));
				console.info('clients.indexOf(req.body.school_name) != -1 : ' + (clients.indexOf(req.body.school_name) != -1));
				if (clients.map(c => c.name).indexOf(req.body.school_name) != -1) {
					try {
						console.log('JSON.stringify(update) : ' + JSON.stringify(update));
						school_id = mongoose.Types.ObjectId(clients[clients.map(c => c.name).indexOf(req.body.school_name)].id);
						console.log('school_id : ' + school_id);
						update['admin.school_id'] = school_id;
						if (req.body.classe) {
							update['admin.class'] = req.body.classe;
						};
						console.log('JSON.stringify(update) : ' + JSON.stringify(update));
					} catch (err) {
						console.error(err);
					}
				}

				new_object = 'newSchool';
				intercom_custom = 'school_name';
				path_to_new_object = 'admin';
				path_to_new_object2 = 'school_name';

				updateVolunteer(type, new_object, intercom_custom, path_to_new_object, path_to_new_object2, update_intercom, new_value, find, update, function(err, send) {
					if (err) {
						err.type = 'MINOR';
						next(err);
						res.status(404).send({
							error: err
						});
					} else {
						res.status(200).send(send);
					}
				});
			});
		} else {
			let err = 'Aucune donnée envoyée au serveur. Essaies de modifier à nouveau ton profil, sinon contacte nous à l\'adresse contact@simplyk.io :)'
			console.error(err);
			err.type = 'MINOR';
			next(err);
			res.status(404).send({
				error: err
			});
		};

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
		} else if (typeof req.body.org_name != 'undefined') {
			console.log(req.body.lastname);
			type = 'org_name';
			new_object = 'newOrgName';
			update.$set = {
				org_name: req.body.org_name
			};
			intercom_custom = 'description';
			path_to_new_object = type;
		} else {
			let err = 'Aucune donnée envoyée au serveur. Essaies de modifier à nouveau ton profil, sinon contacte nous à l\'adresse contact@simplyk.io :)'
			console.error(err);
			ok = false;
			res.status(404).send({
				error: err
			});
		};
		if (ok) {
			Organism.findOneAndUpdate(find, update, {
				new: true
			}, function(err, newOrganism) {
				if (err) {
					err.type = 'MINOR';
					next(err);
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
					if (typeof req.body.org_name != 'undefined') {
						Activity.update({
							'org_id': req.session.organism._id
						}, {
							'org_name': req.body.org_name
						}, {
							multi: true
						}, function(err, info) {
							console.log('Infos from activities update org_name : ' + JSON.stringify(info));
							if (err) {
								err.type = 'CRASH';
								next(err);
							} else {
								console.info('Organism ' + type + ' updated ' + new_value);
								req.session.organism = newOrganism;
								res.status(200).send(send);
								client.users.update(update_intercom);
							}
						})
					} else {
						console.info('Organism ' + type + ' updated ' + new_value);
						req.session.organism = newOrganism;
						res.status(200).send(send);
						client.users.update(update_intercom);
					}
				}
			});
		}
	} else {
		let err = 'Aucune donnée envoyée au serveur. Essaies de modifier à nouveau ton profil, sinon contacte nous à l\'adresse contact@simplyk.io :)';
		err.type = 'MINOR';
		next(err);
		console.error(err);
		res.status(404).send({
			error: err
		});
	}
})

module.exports = router;