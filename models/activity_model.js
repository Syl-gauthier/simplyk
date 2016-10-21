var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ActivitySchema = new Schema({
	id: ObjectId,
	org_id: {type: Schema.Types.ObjectId, ref:'Organism'},
	org_name: String,
	event_intitule: String,
	intitule: String,
	min_age: Number,
	address: String,
	email: String,
	language: String,
	validation: Boolean,
	description: String,
	min_hours: Number,
	lat: Number,
	lon: Number,
	cause: String,
	favorite: Boolean,
	school_id: {type: Schema.Types.ObjectId, ref:'Admin'},
	days: [{
		start_time: String,
		end_time: String,
		day: Date,
		vol_nb: Number,
		applicants: [{type: Schema.Types.ObjectId, ref:'Volunteer'}]
	}]
});

var Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;