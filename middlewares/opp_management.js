/*jslint node: true */


var getOppUsers = function(opp_id, req, res) {

  console.log('-----------------');
  console.log('GETTING OPP APPLICANTS');
  console.log('-----------------');

  Opp.findById(opp_id).populate("applications.applicant").exec(function(err, opp) {
    if (err) {
      console.log(err);
      res.write(err);
      res.end();
    } else {

      /*
      //check the data if necessary
      console.log('OPP.APPLICATIONS');
      console.log('-----------------');
      console.log(opp.applications);
      console.log('-----------------');
      */

      console.log('applicants list : ');
      for (var application in opp.applications) {
        console.log(opp.applications[application].applicant_name);
      }
      console.log('-----------------');

      res.render('applicants.jade', {
        applications: opp.applications
      });
    }
  });

};

var validate_application = function(req, res) {

  var opp_id = req.body.opp_id;
  var applicant_id = req.body.applicant_id;

  console.log('-------------');
  console.log('VALIDATE APPLICATION TO OPP');
  console.log('-------------');
  console.log('opp_id : ' + opp_id);
  console.log('applicant_id : ' + applicant_id);
  console.log('-------------');

  // find Opp in DB
  Opp.findById(req.body.opp_id, function(err, opp) {
    if (err) {
      console.log('Failure to find opp');
      return handleError(err);
    }

    //console.log('opp : ' + opp);

    // validating the subscription for this user
    for (var application in opp.applications) {
      if (opp.applications[application].applicant == applicant_id) {
        opp.applications[application].status = 'Accepted';
      }
    }

    // saving the document
    opp.save(function(err) {
      if (err) {
        console(err);
      }
    });

  });
};

var reject_application = function(req, res) {

  var opp_id = req.body.opp_id;
  var applicant_id = req.body.applicant_id;

  console.log('-------------');
  console.log('REJECT APPLICATION TO OPP');
  console.log('-------------');
  console.log('opp_id : ' + opp_id);
  console.log('applicant_id : ' + applicant_id);
  console.log('-------------');

  // find Opp in DB
  Opp.findById(req.body.opp_id, function(err, opp) {
    if (err) {
      console.log('Failure to find opp');
      return handleError(err);
    }

    //console.log('opp : ' + opp);

    // rejecting the subscription for this user
    for (var application in opp.applications) {
      if (opp.applications[application].applicant == applicant_id) {
        opp.applications[application].status = 'Rejected';
      }
    }

    // saving the document
    opp.save(function(err) {
      if (err) {
        console(err);
      }
    });

  });
};

module.exports = {
  getOppUsers: getOppUsers,
  validate_application: validate_application,
  reject_application: reject_application,
};
