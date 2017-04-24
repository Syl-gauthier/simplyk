var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

var OrganismSchema = new Schema({
	id: ObjectId,
	email: String,
	org_name: String,
	neq: Number,
	website: String,
	password: String,
	email_verified: Boolean, //is the volunteer account verified
	email_verify_string: String, //verify string for verify url
	firstname: String, //Contact info
	lastname: String,
	phone: String,
	description: String,
	admin_id: {
		type: Schema.Types.ObjectId,
		ref: 'Admin'
	},
	school_name: String,
	school_id: {
		type: Schema.Types.ObjectId,
		ref: 'Admin'
	},
	cause: String,
	automatic: Boolean, //if th organism is automatically created
	validation: Boolean, //Simplyk approved ?
	events: [{
		id: ObjectId,
		intitule: String,
		dates: [Date],
		address: String,
		language: String,
		lat: Number,
		lon: Number,
		min_age: Number,
		description: String,
		impact: String,
		status: String,
		activities: [{
			type: Schema.Types.ObjectId,
			ref: 'Activity'
		}]
	}],
	long_terms: [{
		intitule: String,
		description: String,
		address: String,
		lat: Number,
		lon: Number,
		expiration_date: Date,
		min_hours: Number,
		slot: String,
		impact: String,
		vol_nb: Number,
		language: String,
		min_age: Number,
		antecedents: Boolean,
		tags: String,
		applicants: [{
			type: Schema.Types.ObjectId,
			ref: 'Volunteer'
		}]
	}]
});

OrganismSchema.methods.generateHash = crypt.generateHash;
OrganismSchema.methods.validPassword = crypt.validPassword;

var Organism = mongoose.model('Organism', OrganismSchema);

module.exports = Organism;