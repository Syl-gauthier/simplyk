var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

var UserSchema = new Schema({
  id: ObjectId,
  email: String,
  password: String,
  fname: String,
  lname: String,
  birthdate: Date,
  age: Number,
  phone: String,
  hours: Number,
  interests: [String],
  skills: [String],
  complete: Boolean,
  emergency : { // this contact is needed for underaged
      em_name: String,
      em_phone: Number,
  
  },
  student: Boolean, //if has a school or not
  admin: {
      admin_id: ObjectId
  },
  opportunities: [],
});

UserSchema.methods.generateHash = crypt.generateHash;
UserSchema.methods.validPassword = crypt.validPassword;

var User = mongoose.model('Users', UserSchema);

module.exports = User;
