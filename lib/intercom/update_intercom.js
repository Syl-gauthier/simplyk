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
var client = new Intercom.Client({
	token: process.env.INTERCOM_TOKEN
});

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