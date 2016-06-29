var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

var OrganismSchema = new Schema({
	id: ObjectId,
    username: String,
	orgName: String,
	email: String,
    password: String,
});

OrganismSchema.methods.generateHash = crypt.generateHash;
OrganismSchema.methods.validPassword = crypt.validPassword;

var Organism = mongoose.model('Organism', OrganismSchema);

module.exports = Organism;
