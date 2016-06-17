var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('Users', new Schema({
	id: ObjectId,
    username: String,
    password: String,
	fname: String,
	lname: String,
	email: String,
	birth: Date
}));

module.exports = User;
