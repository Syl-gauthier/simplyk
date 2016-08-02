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
	firstname: String, //Contact info
	lastname: String,
	phone: String,
	description: String,
	cause: String, // solidarité, environnement, culture
	validation: Boolean,//Simplyk approved ?
	events: [{
		id: ObjectId,
		intitule: String,
		dates: [Date],
		address: String,
		language: String,
		lat: Number,
		lon: Number,
		description: String,
		status: String,
		activities: [{
			intitule: String,
			description: String,
			min_hours: Number,
			start_time: Date,
			end_time: Date,
			day: Date,
			vol_nb: Number,
			applications: [{
				applicant_id: {type: Schema.Types.ObjectId, ref: 'Volunteer'},
				applicant_name: String
			}]
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
		vol_nb: Number,
		language: String,
		min_age: Number,
		antecedents: Boolean,
		tags: String,
		applications: [{
			applicant_id: {type: Schema.Types.ObjectId, ref: 'Volunteer'},
			applicant_name: String,
			hours_done: Number,
			hours_pending: Number
		}]
	}]
});

OrganismSchema.methods.generateHash = crypt.generateHash;
OrganismSchema.methods.validPassword = crypt.validPassword;

var Organism = mongoose.model('Organism', OrganismSchema);

module.exports = Organism;
