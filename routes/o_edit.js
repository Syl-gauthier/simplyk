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
          res.redirect(req.body.url);
          if (req.body.description) {
            Volunteer.update({
              'long_terms._id': lt_id
            }, {
              'long_terms.$.description': req.body.description
            }, function(err, response) {
              if (err) {
              console.error('ERROR when updating volunteer, but organism update was ok with update : ' + update + ' and the error is ' + err);
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
  }
});

module.exports = router;