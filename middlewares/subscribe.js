/*jslint node: true */

var findApplicants = function(event, callback) {
  var list = [];
  console.log('event.applications');
  console.log(event.applications);
  for (var i = 0; i < event.applications.length; i++) {
    if (typeof event.applications[i].applicant_id !== 'undefined') {
      list.push(event.applications[i].applicant_id.toHexString());
    }
  }
  return callback(list);
};

/**
 * Lists applicants to an event.
 * The returned list is used in subscribeUserToOpp
 * @param  {event} event
 * @return {list} list of applicants
 */
function list_Applicants(event) {
  var list = [];
  for (var i = 0; i < event.applications.length; i++) {
    if (typeof event.applications[i].applicant_id !== 'undefined') {
      list.push(event.applications[i].applicant_id.toHexString());
    }
  }
  return list;
}

/**
 * Subscribes user to event, if he is not yet subscribed.
 * @param  {opportunityortunity} event
 * @param  {user} user
 * @param {response} res
 */
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

  if (applicants_list.indexOf(user._id.toHexString()) !== -1) {

    console.log('---------------');
    console.log('The user is already subscribed to this event.');
    console.log('---------------\n');

    console.log('=========\n  REDIRECTING TO PROFILE \n=========\n ');
    res.send({
      redirect: '/volunteer/profile'
    });


  } else {

    console.log('---------------');
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
        user.save({}, function() {
          console.log('=========\n  REDIRECTING TO PROFILE \n=========\n ');
          res.send({
            redirect: '/volunteer/profile'
          });
        });
      }
    });
  }
};

module.exports = {
  findApplicants: findApplicants,
  subscribeUserToOpp: subscribeUserToOpp,
};
