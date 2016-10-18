/*
USE TO UPDATE INTERCOM FIELDS
*/

var express = require('express');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Intercom = require('intercom-client');
var Organism = require('../../models/organism_model.js');
var Volunteer = require('../../models/volunteer_model.js');
var Admin = require('../../models/admin_model.js');

var client = new Intercom.Client({
	token: process.env.INTERCOM_TOKEN
});
/*
console.log('Start update_intercom.js');
var db_credentials = process.env.MONGO_DB_CREDENTIALS;
if (typeof db_credentials === 'undefined') {
	console.log("DB credentials not defined, use test DB localhost/test");
	db_credentials = 'localhost/test';
}

mongoose.connect('mongodb://' + db_credentials);
Volunteer.find({}, function(err, volunteers) {
	if (err) {
		console.log(err);
	};
	console.log('volunteers.length : ' + volunteers.length);
	volunteers.forEach(function(vol, org_i) {
		const events = vol.events.map(function(event) {
			return event.intitule
		});
		console.log('events : ' + events);
		const long_terms = vol.long_terms.map(function(event) {
			return event.intitule
		});
		console.log('longterms : ' + long_terms);
		var student = false;
		var classe = null;
		if (vol.student) {
			student = true;
			classe = vol.admin.class;
		}
		client.users.update({
			email: vol.email,
			user_id: vol._id,
			custom_attributes: {
				student: student,
				class: classe,
				events: events.toString(),
				long_terms: long_terms.toString()
			}
		});
	});
});
Admin.find({}, function(err, admins) {
	if (err) {
		console.log(err);
	};
	console.log('admins.length : ' + admins.length);
	admins.forEach(function(admin, admin_i) {
		client.users.update({
			email: admin.email,
			user_id: admin._id,
			name: admin.name,
			custom_attributes: {
				class: admin.class,
				group: 'admin'
			}
		});
	});
});
Organism.find({}, function(err, organisms) {
	if (err) {
		console.log(err);
	};
	console.log('organisms.length : ' + organisms.length);
	organisms.forEach(function(organism) {
		client.users.update({
			email: organism.email,
			user_id: organism._id,
			name: organism.org_name,
			custom_attributes: {
				firstname: organism.firstname,
				group: 'organism'
			}
		});
	});
});*/


var update_subscriptions = function(volunteer, subscriptions, callback) {
	if (subscriptions[0].activity_id) {
		//Update Events
		const events = subscriptions.map(function(event) {
			return event.intitule
		});
		console.log('events intitule list : ' + events);
		client.users.update({
			user_id: volunteer._id,
			update_last_request_at: true,
			custom_attributes: {
				events: events.toString()
			}
		}, function(err, d) {
			if (err) {
				return callback(err);
			} else {
				console.log('INFO: Intercom events updated');
				return callback(null);
			}
		});
	} else if (subscriptions[0].description) {
		//Update Longterms
		const long_terms = subscriptions.map(function(lt) {
			return lt.intitule
		});
		console.log('longterms intitule list : ' + long_terms);
		client.users.update({
			user_id: volunteer._id,
			update_last_request_at: true,
			custom_attributes: {
				long_terms: long_terms.toString()
			}
		}, function(err, d) {
			if (err) {
				return callback(err);
			} else {
				console.log('INFO: Intercom longterms updated');
				return callback(null);
			}
		});
	} else {
		client.users.update({
			user_id: volunteer._id,
			update_last_request_at: true
		}, function(err, d) {
			if (err) {
				return callback(err + ' <br> ERR : Not able to know if the new subscription is an event or a longterm !');
			} else {
				return callback(' <br> ERR : Not able to know if the new subscription is an event or a longterm !');
			}
		});
	};
};

module.exports = {
	update_subscriptions: update_subscriptions
};