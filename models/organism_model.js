var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

var OrganismSchema = new Schema({
	id: ObjectId,
	email: String,
	orgName: String,
	neq: Number,
	website: String,
    password: String,
	firstname: String, //Contact info
	lastname: String,
	color: String,
	phone: String,
	mail: String,
	description: String,
	cause: String, // solidarité, environnement, culture
	validation: Boolean,//Simplyk approved ?
	volunteers: [{
		id: { type: Schema.Types.ObjectId, ref: 'Users' },
		user_name: String,
		user_age: Number
	}],
	opp_long: [{
		id: { type: Schema.Types.ObjectId, ref: 'LongOpps' },
		title: String,
		description: String,
		langage: String,
		contact: String,// dans le cas ou ce n'est pas le même que celui qui rentre l'opp ??
		age_min: Number,
		expiration: Date,//?
		judicial:Boolean,//Judicial verification
		address: String,
		cause: String,
		slot: String,
		mandats_long: [{
			slot: String,
			duration: String,
			vol_number: Number,
			tags: [String]
		}]
	}],
	opp_short: [{
		id: { type: Schema.Types.ObjectId, ref: 'ShortOpps' },
		title: String,
		description: String,
		langage: String,
		contact: String,
		age_min: String,
		date: Date,
		judicial:Boolean,
		address: String,
		cause: String,
		mandats_short: [{
			start_hour: Date,
			end_hour: Date,
			activity: String,
			flexible: Boolean,
			vol_number: Number
		}]
	}]
});

OrganismSchema.methods.generateHash = crypt.generateHash;
OrganismSchema.methods.validPassword = crypt.validPassword;

var Organism = mongoose.model('Organism', OrganismSchema);

module.exports = Organism;
