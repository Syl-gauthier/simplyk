var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

var UserSchema = new Schema({
	id: ObjectId,
    username: String,
    password: String,
	fname: String,
	lname: String,
	email: String,
	birth: Date
});

UserSchema.methods.generateHash = crypt.generateHash;
UserSchema.methods.validPassword = crypt.validPassword;

var User = mongoose.model('Users', UserSchema);

module.exports = User;
