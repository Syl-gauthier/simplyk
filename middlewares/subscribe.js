/*jslint node: true */

var Opp = require('../models/opp_model.js');

var findApplicants = function(opp, callback) {
  var list = [];
  console.log('opp.applications');
  console.log(opp.applications);
  for (var i = 0; i < opp.applications.length; i++) {
    if (typeof opp.applications[i].applicant !== 'undefined') {
      list.push(opp.applications[i].applicant.toHexString());
    }
  }
  return callback(list);
};

/**
 * Lists applicants to an opp.
 * The returned list is used in subscribeUserToOpp
 * @param  {opp} opp
 * @return {list} list of applicants
 */
function list_Applicants(opp) {
  var list = [];
  for (var i = 0; i < opp.applications.length; i++) {
    if (typeof opp.applications[i].applicant !== 'undefined') {
      list.push(opp.applications[i].applicant.toHexString());
    }
  }
  return list;
}

/**
 * unsubscribes user to opp
 * @param  {opp} opp
 * @param  {user} user
 * @param {response} res
 */
var subscribeUserToOpp = function(req, res) {

  Opp.findById(req.body.opp_id, function(err, opp) {
    if (err) {
      console.log('Failure to find opp');
      return handleError(err);
    }

    // get user
    var user = req.user;

    console.log('\n=========\n PROCESSING SUBSCRIPTION\n=========\n');
    console.log('opp name : ' + opp.intitule);
    console.log('---------------');
    console.log('user id : ' + user._id);
    console.log('---------------');
    //console.log('opp : ');
    //console.log(opp);

    var applicants_list = list_Applicants(opp);
    console.log('applicants_list : ');
    console.log(applicants_list);

    if (applicants_list.indexOf(user._id.toHexString()) !== -1) {

      console.log('---------------');
      console.log('The user is already subscribed to this opp.');
      console.log('---------------\n');

      console.log('=========\n  REDIRECTING TO PROFILE \n=========\n ');
      res.send({
        redirect: '/volunteer/profile'
      });


    } else {

      console.log('---------------');
      console.log('The user is not subscribed yet. Subscribing user.');
      console.log('---------------\n');

      opp.applications.addToSet({
        "applicant": user._id,
        "applicant_name": user.firstname + ' ' + user.lastname,
        "status": "Pending",
        "story": null
      });
      opp.save(function(err) {
        if (err) {
          console(err);
        } else {
          user.opportunities.push({
            opp: opp._id
          });
          user.save({}, function() {
            console.log('=========\n  REDIRECTING TO PROFILE \n=========\n ');
            res.send({
              redirect: '/volunteer/profile'
            });
          });
        }
      });
    }
  });
};

var unsubscribeUserToOpp = function(req, res) {

  console.log('-------------');
  console.log('UNSUBSCRIBING USER TO OPP');
  console.log('-------------');

  Opp.findById(req.body.opp_id, function(err, opp) {
    if (err) {
      console.log('Failure to find opp');
      return handleError(err);
    }

    // get user
    var user = req.user;

    console.log('opp name : ' + opp.intitule);
    console.log('---------------');
    console.log('user id : ' + user._id);
    console.log('---------------');

    for (var i = 0; i < opp.applications.length; i++) {
      if (typeof opp.applications[i].applicant !== 'undefined') {
        if (opp.applications[i].applicant.toHexString() == user._id) {
          //opp.applications[i].applicant.splice(i,1);
          console.log('---------------');
          console.log('OPP.APPLICATIONS[i]');
          console.log(opp.applications[i]);
          opp.applications.remove(opp.applications[i]);
        }
      }
    }

    opp.save(function(err) {
      if (err) {
        console(err);
      } else {
        console.log('=========\n  REDIRECTING TO PROFILE \n=========\n ');
        res.send({
          redirect: '/volunteer/profile'
        });
      }
    });
  });
};

module.exports = {
  findApplicants: findApplicants,
  subscribeUserToOpp: subscribeUserToOpp,
  unsubscribeUserToOpp: unsubscribeUserToOpp,
};
