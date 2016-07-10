/*jslint node: true */

var findApplicants = function(opp, callback) {
  var list = [];
  console.log('opp.applications');
  console.log(opp.applications);
  for (var i = 0; i < opp.applications.length; i++) {
    list.push(opp.applications[i].applicant.toHexString());
  }
  return callback(list);
};

/**
 * Lists applicants to an opportunity.
 * The returned list is used in subscribeUserToOpp
 * @param  {opportunity} opportunity
 * @return {list} list of applicants
 */
function list_Applicants(opportunity) {
  var list = [];
  for (var i = 0; i < opportunity.applications.length; i++) {
    list.push(opportunity.applications[i].applicant.toHexString());
  }
  return list;
}

/**
 * Subscribes user to opportunity, if he is not yet subscribed.
 * @param  {opportunityortunity} opportunity
 * @param  {user} user
 * @param {response} res
 */
var subscribeUserToOpp = function(opportunity, user, res) {

  console.log('\n=========\n PROCESSING SUBSCRIPTION\n=========\n');
  console.log('opportunity name : ' + opportunity.intitule);
  console.log('---------------');
  console.log('user id : ' + user._id);
  console.log('---------------');

  var applicants_list = list_Applicants(opportunity);
  console.log('applicants_list : ');
  console.log(applicants_list);

  if (applicants_list.indexOf(user._id.toHexString()) !== -1) {

    console.log('---------------');
    console.log('The user is already subscribed to this opportunity.');
    console.log('---------------\n');

    console.log('=========\n  REDIRECTING TO PROFILE \n=========\n ');
    res.send({
      redirect: '/volunteer/profile'
    });


  } else {

    console.log('---------------');
    console.log('The user is not subscribed yet.');
    console.log('---------------\n');

    opportunity.applications.addToSet({
      "applicant": user._id,
      "status": "Pending",
      "story": null
    });
    opportunity.save(function(err) {
      if (err) {
        console(err);
      } else {
        user.opportunities.push({
          opp: opportunity._id
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
