var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('User', new Schema({
	_id: ObjectId,
	name: String,
	email: String
}));

module.exports = User;
