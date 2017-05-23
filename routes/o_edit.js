'use strict';

const express = require('express');
const router = express.Router();

const permissions = require('../middlewares/permissions.js');

const remove = require('../public/javascripts/organism/remove.js');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Organism = require('../models/organism_model.js');
const Volunteer = require('../models/volunteer_model.js');
const Activity = require('../models/activity_model.js');

router.post('/edit-longterm', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  console.info('DATAS : req.body : ' + JSON.stringify(req.body));
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
        err.type = 'MINOR';
        next(err);
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
                err.type = 'MINOR';
                next(err);
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
  } else if (req.body.expiration_date) {
    update = {
      'long_terms.$.expiration_date': req.body.expiration_date
    };
    mongoOrganismUpdate(update);
  } else if (req.body.min_age) {
    update = {
      'long_terms.$.min_age': req.body.min_age
    };
    mongoOrganismUpdate(update);
  } else if (req.body.archive) {
    update = {
      'long_terms.$.tags': 'archived'
    };
    mongoOrganismUpdate(update);
  } else if (req.body.recover) {
    update = {
      'long_terms.$.tags': ''
    };
    mongoOrganismUpdate(update);
  }
});


router.post('/edit-event', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  console.info('DATAS : req.body : ' + JSON.stringify(req.body));
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
        err.type = 'MINOR';
        next(err);
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
          if (req.body.description || req.body.intitule || req.body.min_age) {
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
              };
              //A PROBLEM IS LEFT FOR NOW, BUT NOT URGENT (PEOPLE WHO ARE ALREADY SUBSCRIBED TO MULTIPLE ACTIVTY OF THE EVENT HAVE ONLY ONE ACIVITY UPDATED WITH THE NEW EVENT_INTITULE)
            } else if (req.body.min_age) {
              activity_update = {
                'min_age': req.body.min_age
              };
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
                err.type = 'MINOR';
                next(err);
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
                    err.type = 'MINOR';
                    next(err);
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
    if (req.body.vol_nb && (req.body.vol_nb.length < 1)) {
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
      }, activity_nb_vol_update, function(err, response) {
        if (err) {
          err.type = 'CRASH';
          err.print = 'Problème lors de la modification du bénévolat : nous avons néanmoins récupérer les informations nécessaires. Vous pouvez soit nous envoyer un courriel, soit recommencer l\'opération';
          next(err);
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
  } else if (req.body.min_age) {
    update = {
      'events.$.min_age': req.body.min_age
    };
    mongoOrganismUpdate(update);
  } else {
    const err_string = encodeURIComponent('La requête n\'a pas été comprise. Essaye de nouveau ou sinon, contacte nous par téléphone ou courriel :)');
    res.redirect(req.body.url + '?error=' + err_string);
  }
});


router.post('/edit-activity', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  console.info('DATAS : req.body : ' + JSON.stringify(req.body));
  const act_id = req.body.act_id;
  console.log('act_id to update : ' + act_id);
  let update = {};

  function mongoOrganismUpdate(update) {
    Activity.findOneAndUpdate({
      '_id': act_id
    }, update, function(err) {
      if (err) {
        err.type = 'MINOR';
        next(err);
        const err_string = encodeURIComponent('Une erreur est survenue. Essaye de nouveau ou sinon, contacte nous par téléphone ou courriel :)')
        res.redirect(req.body.url + '?error=' + err_string);
      } else {
        console.info('SUCCESS : we have updated activity with activity_id =  ' + act_id);
        req.session.save(function() {
          res.redirect(req.body.url);
        });
      }
    })
  };

  if (req.body.archive) {
    update = {
      'archived': true
    };
    mongoOrganismUpdate(update);
  } else if (req.body.recover) {
    update = {
      'archived': false
    };
    mongoOrganismUpdate(update);
  }
});

router.post('/remove-activity:act_id', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  console.log('DATAS : req.params : ' + JSON.stringify(req.params));
  let error = {};
  let message = {};
  if (req.params.act_id) {
    remove.removeActivity(req.params.act_id, function(err) {
      if (err) {
        err.type = 'CRASH';
        err.print = 'Problème lors de la suppression du bénévolat : nous avons néanmoins récupérer les informations nécessaires. Vous pouvez soit nous envoyer un courriel, soit recommencer l\'opération';
        next(err);
      } else {
        message = 'Activité supprimée avec succès';
        Organism.findOne({
          '_id': req.session.organism._id
        }, function(err, organism) {
          if (err) {
            err.type = 'MINOR';
            next(err);
          }
          req.session.organism = organism;
          req.session.save(function() {
            res.redirect('/organism/dashboard?message=' + message);
          });
        });
      }
    });
  } else {
    error = 'Les données de la requêtes ne sont pas lisibles'
    console.error('ERR : ' + err);
    res.redirect('/organism/dashboard?error=' + error);
  }
});

router.post('/edit-manual', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  console.log('DATAS : JSON.stringify(req.body) : ' + JSON.stringify(req.body));
  if (req.body.new_description && req.body.man_id) {
    Volunteer.findOneAndUpdate({
      'manuals._id': req.body.man_id
    }, {
      'manuals.$.description': req.body.new_description
    }, function(err) {
      if (err) {
        err.type = 'MINOR';
        next(err);
        console.error('ERROR : in edit-manual POST : mongo findOneAndUpdate callback give an error');
        res.status(400).send({
          error: 'Il semble qu\'il y ait un problème avec les informations envoyées à la base de données'
        });
      } else {
        console.info('SUCCESS: in edit-manual POST : manual changed');
        res.status(200).end();
      }
    })
  } else if (req.body.hours_done && req.body.man_id) {
    Volunteer.findOneAndUpdate({
      'manuals._id': req.body.man_id
    }, {
      'manuals.$.hours_done': req.body.hours_done
    }, function(err) {
      if (err) {
        err.type = 'MINOR';
        next(err);
        console.error('ERROR : in edit-manual POST : mongo findOneAndUpdate callback give an error');
        res.status(400).send({
          error: 'Il semble qu\'il y ait un problème avec les informations envoyées à la base de données'
        });
      } else {
        console.info('SUCCESS: in edit-manual POST : manual changed');
        res.status(200).end();
      }
    })
  } else {
    console.error('ERROR : in edit-manual POST : all the req.body informations are not fullfilled');
    res.status(400).send({
      error: 'Il semble qu\'il y ait un problème avec les informations envoyées au serveur'
    });
  }
});


router.post('/remove-manual:man_id', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  console.log('JSON.stringify(req.params) : ' + JSON.stringify(req.params));
  if (req.params.man_id) {
    Volunteer.findOneAndUpdate({
      'manuals._id': req.params.man_id
    }, {
      '$pull': {
        'manuals': {
          '_id': req.params.man_id
        }
      }
    }, function(err) {
      if (err) {
        err.type = 'MINOR';
        next(err);
        console.error('ERROR : in remove-manual POST : mongo findOneAndUpdate callback give an error');
        res.status(400).send({
          err: 'Il semble qu\'il y ait un problème avec les informations envoyées à la base de données : la suppression ne s\'est pas correctement terminée'
        });
      } else {
        console.info('SUCCESS: in remove-manual POST : manual changed');
        res.status(200).end();
      }
    })
  } else {
    console.error('ERROR : in remove-manual POST : all the req.params informations are not fullfilled');
    res.status(400).send({
      err: 'Il semble qu\'il y ait un problème avec les informations envoyées au serveur : la suppression ne s\'est pas correctement terminée'
    });
  }
});

module.exports = router;