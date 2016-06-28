var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('Users', new Schema({
	id: ObjectId,
	password: String,
	firstname: String,
	lastname: String,
	mail: String,
	birthdate: Date,
	age: Number,
	phone: String,
	hours: Number,
	interests: [String],
	skills: [String],
	complete: Boolean,
	emergency : { // this contact is needed for minors
		em_name: String,
		em_phone: Number,
	
	},
	student: Boolean, //if has a school or not
	admin: {
		admin_id: ObjectId,
		admin_name: String,
		admin_mail: String
	}
}));

module.exports = User;