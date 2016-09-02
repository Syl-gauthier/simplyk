/*var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Opp = require('../models/opp_model.js');
var User = require('../models/user_model.js');

mongoose.connect('mongodb://localhost/test');

Opp.findById("57416043bc4b9bd932aa1449", function(err, opp){
  if (err) console.log(err);

  console.log(opp.toString());
});

Opp.findById("57416043bc4b9bd932aa1449").populate("applications.applicant")
  .exec(function(err, opp){
    console.log(err);

    console.log(opp.toString());
    console.log(opp.applications[0].toString());
  });
*/