'use strict';

const express = require('express');
const router = express.Router();
const permissions = require('../middlewares/permissions.js');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Organism = require('../models/organism_model.js');
const Volunteer = require('../models/volunteer_model.js');
const Activity = require('../models/activity_model.js');

router.post('/edit-longterm', permissions.requireGroup('organism'), function(req, res) {
  console.info('req.body : ' + JSON.stringify(req.body));
  const lt_id = req.body.url.substring(req.body.url.length - 24);
  console.log('lt_id to update : ' + lt_id);
  let update = {};

  function mongoOrganismUpdate(update) {
    Organism.findOneAndUpdate({
      '_id': req.session.organism._id,
      'long_terms._id': lt_id
    }, update, {
      new: true
    }, function(err, organism_updated) {
      if (err) {
        console.error('ERROR when updating with update : ' + update + ' and the error is ' + err);
        const err_string = encodeURIComponent('Une erreur est survenue. Essaye de nouveau ou sinon, contacte nous par téléphone ou courriel :)')
        res.redirect(req.body.url + '?error=' + err_string);
      } else {
        console.info('SUCCESS : we have updated long_term for organism ' + organism_updated.org_name);
        req.session.organism = organism_updated;
        req.session.save(function() {
          let volunteer_update = {};
          res.redirect(req.body.url);
          if (req.body.description || req.body.intitule) {
            if (req.body.description) {
              volunteer_update = {
                'long_terms.$.description': req.body.description
              };
            } else if (req.body.intitule) {
              volunteer_update = {
                'long_terms.$.intitule': req.body.intitule
              };
            }

            Volunteer.update({
              'long_terms._id': lt_id
            }, volunteer_update, function(err, response) {
              if (err) {
                console.error('ERROR when updating volunteer, but organism update was ok, with update : ' + volunteer_update + ' and the error is ' + err);
              } else {
                console.info('SUCCESS : we have updated long_term for organism ' + organism_updated.org_name + ' and volunteers with response : ' + JSON.stringify(response));
                res.end();
              }
            })
          }
        });
      }
    })
  };

  if (req.body.vol_nb) {
    //Edit vol_nb
    //Check if req.body.vol_nb < numbre of applicants
    const long_term_in_session = req.session.organism.long_terms.find(function(lt) {
      return lt._id == lt_id;
    });

    if (long_term_in_session.applicants.length > req.body.vol_nb) {
      const err_string = encodeURIComponent('Il ne peut pas y avoir moins de places disponibles que de bénévoles déjà inscrits.');
      res.redirect(req.body.url + '?error=' + err_string);
    } else {
      update = {
        'long_terms.$.vol_nb': req.body.vol_nb
      };
      mongoOrganismUpdate(update);
    }
  } else if (req.body.description) {
    update = {
      'long_terms.$.description': req.body.description
    };
    mongoOrganismUpdate(update);
  } else if (req.body.intitule) {
    update = {
      'long_terms.$.intitule': req.body.intitule
    };
    mongoOrganismUpdate(update);
  }
});


router.post('/edit-event', permissions.requireGroup('organism'), function(req, res) {
  console.info('req.body : ' + JSON.stringify(req.body));
  const event_id = req.body.url.substring(req.body.url.length - 24);
  console.log('event_id to update : ' + event_id);
  let update = {};

  function mongoOrganismUpdate(update) {
    Organism.findOneAndUpdate({
      '_id': req.session.organism._id,
      'events._id': event_id
    }, update, {
      new: true
    }, function(err, organism_updated) {
      if (err) {
        console.error('ERROR when updating with update : ' + update + ' and the error is ' + err);
        const err_string = encodeURIComponent('Une erreur est survenue. Essaye de nouveau ou sinon, contacte nous par téléphone ou courriel :)')
        res.redirect(req.body.url + '?error=' + err_string);
      } else {
        console.info('SUCCESS : we have updated event for organism ' + organism_updated.org_name);
        req.session.organism = organism_updated;
        req.session.save(function() {
          let volunteer_update = {};
          let activity_update = {};
          res.redirect(req.body.url);
          const event_in_organism = req.session.organism.events.find(function(event) {
            return event._id == event_id
          });

          const activities_volunteers_to_update = event_in_organism.activities;
          if (req.body.description || req.body.intitule) {
            if (req.body.description) {
              volunteer_update = {
                'events.$.description': req.body.description
              };
            } else if (req.body.intitule) {
              volunteer_update = {
                'events.$.intitule': req.body.intitule
              };
              activity_update = {
                'event_intitule': req.body.intitule
              }
              //A PROBLEM IS LEFT FOR NOW, BUT NOT URGENT (PEOPLE WHO ARE ALREADY SUBSCRIBED TO MULTIPLE ACTIVTY OF THE EVENT HAVE ONLY ONE ACIVITY UPDATED WITH THE NEW EVENT_INTITULE)
            }

            Volunteer.update({
              'events': {
                '$elemMatch': {
                  'activity_id': {
                    '$in': activities_volunteers_to_update
                  }
                }
              }
            }, volunteer_update, {
              multi: true
            }, function(err, response) {
              if (err) {
                console.error('ERROR when updating volunteer, but organism update was ok, with update : ' + volunteer_update + ' and the error is ' + err);
              } else {
                console.info('SUCCESS : we have updated event for organism ' + organism_updated.org_name + ' and volunteers with response : ' + JSON.stringify(response));
                Activity.update({
                  '_id': {
                    '$in': activities_volunteers_to_update
                  }
                }, activity_update, {
                  multi: true
                }, function(err, response) {
                  if (err) {
                    console.error('ERROR when updating volunteer, but organism update was ok, with update : ' + volunteer_update + ' and the error is ' + err);
                  } else {
                    console.info('SUCCESS : we have updated event for organism ' + organism_updated.org_name + ' and activities with response : ' + JSON.stringify(response));
                    res.end();
                  };
                })
              }
            })
          }
        });
      }
    })
  };

  if (req.body.vol_nb) {
    //Edit vol_nb
    //Check if req.body.vol_nb < number of applicants
    console.info(req.body.vol_nb.length + ' : req.body.vol_nb.length')
    if (req.body.vol_nb && (req.body.vol_nb.length < 1)){
      const err_string = encodeURIComponent('Le champ du nombre de bénévoles recherchés doit être rempli.');
      res.redirect(req.body.url + '?error=' + err_string);
    } else if (req.body.nb_applicants > req.body.vol_nb) {
      const err_string = encodeURIComponent('Il ne peut pas y avoir moins de places disponibles que de bénévoles déjà inscrits.');
      res.redirect(req.body.url + '?error=' + err_string);
    } else {
      //Update activity with the new number of people asked
      const activity_nb_vol_update = {
        'days.$.vol_nb': req.body.vol_nb
      };
      Activity.update({
        '_id': req.body.activity_id,
        'days.day': req.body.day
      }, activity_nb_vol_update, function(err, response){
        if (err) {
          console.error('ERROR when updating activity, with update : ' + activity_nb_vol_update + ' and the error is ' + err);
        } else {
          console.info('SUCCESS : we have updated activity ' + activity_nb_vol_update + ' and activities with response : ' + JSON.stringify(response));
          res.redirect(req.body.url);
          res.end();
        };
      })
    }
  } else if (req.body.description) {
    update = {
      'events.$.description': req.body.description
    };
    mongoOrganismUpdate(update);
  } else if (req.body.intitule) {
    update = {
      'events.$.intitule': req.body.intitule
    };
    mongoOrganismUpdate(update);
  } else {
    const err_string = encodeURIComponent('La requête n\'a pas été comprise. Essaye de nouveau ou sinon, contacte nous par téléphone ou courriel :)');
    res.redirect(req.body.url + '?error=' + err_string);
  }
});

module.exports = router;