//Volunteer related routes
var express = require('express');

var permissions = require('../middlewares/permissions.js');

var Opp = require('../models/opp_model.js');
var subscribe = require('../middlewares/subscribe.js');
var router = express.Router();

/*GET map page*/
router.get('/map', permissions.requireGroup('volunteer'), function(req, res){
  Opp.find({}, function(err, opps){
    if(err){
      console.log(err);
      res.render('map.jade', {session: req.session, error: err});
    }
    //Create opps list
    else{           
      console.log(req.isAuthenticated());
      res.render('map.jade', {opps: opps, user: req.isAuthenticated()});
    }
  });
});

/* GET users listing. */
router.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/subscribe', function(req,res){
  //identifiant de l'opp sur laquelle on a cliqué
  console.log(req.body.opportunity_id);

  //Search opp in DB
  Opp.findById(req.body.opportunity_id, function(err, opportunity){
    if (err){
      console.log('Failure to find opportunity');
      return handleError(err);
    }

    console.log(opportunity.toJSON());
    //If the user has already subscribed to this opp, end, if not, subscription and go to profile
    subscribe.findApplicants(opportunity, function(applicantsList){
      console.log('applicantsList: '+applicantsList);
      if (opportunity.applications.indexOf(req.user._id) !== -1){
        var error = 'Tu es déjà inscrit à cet évènement ! :)';
        console.log(error);
        res.send({error: error});
      }
      else{
        console.log('The user has not yet subscribed to this opp');
        opportunity.applications.addToSet({"applicant": req.user._id, "status": "Pending", "story": null});
        opportunity.save(function(err){
          if(err){
            console(err);
          }
          else{
            req.user.opportunities.push({opp: opportunity._id});
            req.user.save({}, function(err){
              console.log('redirect to profile')
              res.send({redirect: 'profile'});
            })
          }
        });
      }
    });
  });
});

module.exports = router;
