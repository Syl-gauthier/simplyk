var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

var VolunteerSchema = new Schema({
  id: ObjectId,
  email: String,
  password: String,
  firstname: String,
  lastname: String,
  birthdate: Date,
  phone: String,
  complete: Boolean,
  emergency : { // this contact is needed for underaged
      em_name: String,
      em_phone: Number,
  },
  events : [{
    intitule: String,
    address: String,
    lat: Number,
    lon: Number,
    day: Date,
    description_event: String,
    description_activity: String,
    org_id: {type: Schema.Types.ObjectId, ref:'Organism'},
    org_name: String,
    start_time: Date,
    end_time: Date,
    hours_done: Number,
    status: String,
    hours_pending: Number
  }],
  longTerms: [{
    intitule: String,
    description: String,
    address: String,
    lat: Number,
    lon: Number,
    slot: String,
    hours_pending: Number,
    hours_done: Number
  }],
  student: Boolean, //if has a school or not
  admin: {
      admin_id: {type: Schema.Types.ObjectId, ref: 'Admin'}
  }
});

VolunteerSchema.methods.generateHash = crypt.generateHash;
VolunteerSchema.methods.validPassword = crypt.validPassword;

var Volunteer = mongoose.model('Volunteer', VolunteerSchema);

module.exports = Volunteer;
