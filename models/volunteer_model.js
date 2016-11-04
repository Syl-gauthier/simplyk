var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var crypt = require('../auth/crypt');

var VolunteerSchema = new Schema({
  id: ObjectId,
  email: String,
  email_verified: Boolean, //is the volunteer account verified
  email_verify_string: String, //verify string for verify url
  password: String,
  firstname: String,
  lastname: String,
  birthdate: Date,
  phone: String,
  complete: Boolean,
  emergency: { // this contact is needed for underaged
    em_name: String,
    em_phone: Number,
  },
  events: [{
    activity_id: {
      type: Schema.Types.ObjectId,
      ref: 'Activity'
    },
    intitule: String,
    address: String,
    lat: Number,
    lon: Number,
    day: Date,
    email: String,
    description_event: String,
    intitule_activity: String,
    org_id: {
      type: Schema.Types.ObjectId,
      ref: 'Organism'
    },
    org_name: String,
    start_time: String,
    end_time: String,
    hours_done: Number,
    status: String,
    extra: Boolean,
    hours_pending: Number,
    student_questions: [String],
    student_answers: [String],
    organism_questions: [String],
    organism_answers: [String]
  }],
  long_terms: [{
    intitule: String,
    description: String,
    address: String,
    org_id: {
      type: Schema.Types.ObjectId,
      ref: 'Organism'
    },
    org_name: String,
    lat: Number,
    lon: Number,
    slot: String,
    hours_pending: Number,
    hours_done: Number,
    status: String,
    student_questions: [String],
    student_answers: [String],
    organism_questions: [String],
    organism_answers: [String]
  }],
  student: Boolean, //if has a school or not
  admin: {
    school_id: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    class: String,
    school_name: String
  },
  extras: [{ //activities created by the student
    email: String,
    org_name: String,
    org_phone: String,
    intitule: String,
    activity_id: {
      type: Schema.Types.ObjectId,
      ref: 'Activity'
    },
    description: String,
    status: String, //confirmed, pending
    days: [{
      day: Date,
      applicants: [{
        type: Schema.Types.ObjectId,
        ref: 'Volunteer'
      }]
    }],
    hours_pending: Number,
    hours_done: Number,
    student_questions: [String],
    student_answers: [String],
    organism_questions: [String],
    organism_answers: [String]
  }]
});

VolunteerSchema.methods.generateHash = crypt.generateHash;
VolunteerSchema.methods.validPassword = crypt.validPassword;

var Volunteer = mongoose.model('Volunteer', VolunteerSchema);

module.exports = Volunteer;