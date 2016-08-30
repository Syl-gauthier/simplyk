var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

//Admin schema creation
var AdminSchema = new Schema({
	id: ObjectId,
	name: String,
	type: String, //School or company
	lastName: String, //Contact info
	firstName: String,
    password: String,
	lat: Number,
	lon: Number,
	email: String,
	students: [{
		id: { type: Schema.Types.ObjectId, ref: 'Volunteers' },
		status: String
	}]//mails des utilisateurs qui ont mis l'Adminortunité en favori
});

AdminSchema.methods.generateHash = crypt.generateHash;
AdminSchema.methods.validPassword = crypt.validPassword;

var Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;