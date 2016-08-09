/*jslint node: true */
/*
var findApplicants = function(day, callback) {
  var list = [];
  console.log('event.applications');
  console.log(event.applications);
  for (var i = 0; i < event.applications.length; i++) {
    if (typeof event.applications[i].applicant_id !== 'undefined') {
      list.push(event.applications[i].applicant_id.toHexString());
    }
  }
  return callback(list);
};*/

/**
<<<<<<< HEAD
 * Lists applicants to an opp.
 * The returned list is used in subscribeUserToOpp
 * @param  {opp} opp
=======
 * Lists applicants to an event.
 * The returned list is used in subscribeUserToOpp
 * @param  {event} event
>>>>>>> update_models
 * @return {list} list of applicants
 *//*
function list_Applicants(event) {
  var list = [];
  for (var i = 0; i < event.applications.length; i++) {
    if (typeof event.applications[i].applicant_id !== 'undefined') {
      list.push(event.applications[i].applicant_id.toHexString());
    }
  }
  return list;
}

function list_opps(user) {
  var list = [];
  for (var i = 0; i < user.opportunities.length; i++) {
    if (typeof user.opportunities[i].opp !== 'undefined') {
      list.push(user.opportunities[i].opp.toHexString());
    }
  }
  return list;
}*/

/**
<<<<<<< HEAD
 * unsubscribes user to opp
 * @param  {opp} opp
 * @param  {user} user
 * @param {response} res
 *//*
var subscribeUserToOpp = function(req, res) {

  Opp.findById(req.body.opp_id, function(err, opp) {
    if (err) {
      console.log('Failure to find opp');
      return handleError(err);
    }*/
    /*
 * Subscribes user to event, if he is not yet subscribed.
 * @param  {opportunityortunity} event
 * @param  {user} user
 * @param {response} res
 *//*
var subscribeUserToOpp = function(event, user, res) {

  console.log('\n=========\n PROCESSING SUBSCRIPTION\n=========\n');
  console.log('event name : ' + event.intitule);
  console.log('---------------');
  console.log('user id : ' + user._id);
  console.log('---------------');
  //console.log('event : ');
  //console.log(event);

  var applicants_list = list_Applicants(event);
  console.log('applicants_list : ');
  console.log(applicants_list);
>>>>>>> update_models

    // get user
    var user = req.user;

    console.log('\n=========\n PROCESSING SUBSCRIPTION\n=========\n');
    console.log('opp name : ' + opp.intitule);
    console.log('---------------');
    console.log('user id : ' + user._id);
    console.log('---------------');
<<<<<<< HEAD
=======
    console.log('The user is already subscribed to this event.');
    console.log('---------------\n');
>>>>>>> update_models

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

          // add the opportinuty in the user document
          var user_opps = list_opps(user);
          var opp_id_obj = opp._id;
          var opp_id = opp_id_obj.toHexString();

          // in case it is already in the document (eg due to database update)
          if (user_opps.indexOf(opp_id) == -1) {
            user.opportunities.push({
              opp: opp._id
            });
          }

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
<<<<<<< HEAD
    console.log('opp id : ' + opp._id);
    console.log('---------------');
    console.log('user id : ' + user._id);
    console.log('---------------');
    console.log('REMOVE USER APPLICATION FROM OPP APPLICATIONS');
    console.log('---------------');

    // get user application to this opp
    var opp_applications = list_Applicants(opp);
    var user_id_obj = user._id;
    var user_id = user_id_obj.toHexString();
    var application_index = opp_applications.indexOf(user_id);
    console.log('application_index : ' + application_index);

    opp.applications.remove(opp.applications[application_index]);

    opp.save(function(err) {
      if (err) {
        console(err);
      } else {

        console.log('---------------');
        console.log('REMOVE OPP FROM USER OPPORTUNITIES');
        console.log('---------------');

        // get opp to remove in user opportunities
        var user_opps = list_opps(user);
        var opp_id_obj = opp._id;
        var opp_id = opp_id_obj.toHexString();
        var opp_index = user_opps.indexOf(opp_id);
        console.log('opp_index : ' + opp_index);

        user.opportunities.remove(user.opportunities[opp_index]);

=======
    console.log('The user is not subscribed yet. Subscribing user.');
    console.log('---------------\n');

    event.applications.addToSet({
      "applicant_id": user._id,
      "applicant_name": user.firstname + user.firstname,
    });
    event.save(function(err) {
      if (err) {
        console(err);
      } else {
        user.opportunities.push({
          event: event._id
        });
>>>>>>> update_models
        user.save({}, function() {
          console.log('=========\nREDIRECTING TO PROFILE \n=========\n ');
          res.send({
            redirect: '/volunteer/profile'
          });
        });
      }
    });
  });
};

module.exports = {
  findApplicants: findApplicants,
  subscribeUserToOpp: subscribeUserToOpp,
  unsubscribeUserToOpp: unsubscribeUserToOpp,
};*/
