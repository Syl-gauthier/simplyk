var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Opp = require('../models/opp_model.js');

mongoose.connect('mongodb://localhost/test');

Opp.findById("574141f51e02bba827949b82", function(err, opp){
  if (err) console.log(err);

  console.log(opp.toString());
});
