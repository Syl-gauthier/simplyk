var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

//Admin schema creation
var AdminSchema = new Schema({
	id: ObjectId,
	name: String,
	type: String, //School or company
	lastname: String, //Contact info
	firstname: String,
    password: String,
    class: String,
    classes: [String],
	lat: Number,
	lon: Number,
	email: String,
	school_id: { type: Schema.Types.ObjectId, ref: 'Admin' },//ID of the school coordinator
	students: [{
		id: { type: Schema.Types.ObjectId, ref: 'Volunteer' },
		status: String //'update_subscription' if it is the vol who claim that he belongs to the school
	}]//mails des utilisateurs qui ont mis l'Adminortunité en favori
});

AdminSchema.methods.generateHash = crypt.generateHash;
AdminSchema.methods.validPassword = crypt.validPassword;

var Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;