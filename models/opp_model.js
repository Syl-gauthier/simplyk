var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//Opportunity schema creation
var Opp = mongoose.model('Opp', new Schema({
	intitule: String,
	orgName: String,
	nbBenevoles: Number,
	date: Date,
	address: String, //Full adress for convenience
	lat: Number,
	lon: Number,
	mail: String,
	applications: [{
		applicant: { type: Schema.Types.ObjectId, ref: 'Volunteers' },
		applicant_name: String,
		status: String,
		story: String
	}]
}));

module.exports = Opp;
