var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//Opportunity schema creation
var Opp = mongoose.model('Opp', new Schema({
	_id: ObjectId,
	intitule: String,
	oName: String,
	nbBenevoles: Number,
	date: Date,
  venue: String, //Full adress for convenience
	lat: Number,
	lon: Number,
	mail: String,
	users: [{
		id: ObjectId,
		status: String,
    story: String,
	}]
}));

module.exports = Opp;
