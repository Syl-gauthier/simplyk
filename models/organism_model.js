var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Organism = mongoose.model('Organism', new Schema({
	id: ObjectId,
    username: String,
	orgName: String,
	email: String,
    password: String,
}));

module.exports = Organism;
