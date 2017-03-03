'use strict';
const express = require('express');
const router = express.Router();
const permissions = require('../middlewares/permissions.js');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Organism = require('../models/organism_model.js');
const Volunteer = require('../models/volunteer_model.js');

router.post('/volunteer/edit-student-feedbacks', permissions.requireGroup('volunteer'), function(req, res, next) {
	console.info('DATAS : req.body : ' + JSON.stringify(req.body));
	let find_query = {};
	let update_pull_query = {};
	let update_push_query = {};

	let new_student_answers = new Array();
	if (typeof req.body.new_response == 'string') {
		console.info('this is a string');
		new_student_answers[0] = req.body.new_response;
	} else {
		console.info('this is another thing : ' + typeof req.body.new_response);
		new_student_answers = req.body.new_response;
	}

	console.log('new_student_answers : ' + JSON.stringify(new_student_answers));


	if (req.body.lt_id) {
		//Find long_terms index in req.session.volunteer to apply to mongo search (DANGEROUS BUT AFTER MULTIPLE HOURS .........)
		console.info('We are starting to update answers to a longterm');
		find_query = {
			'_id': req.session.volunteer._id,
			'long_terms._id': req.body.lt_id
		}
		update_pull_query = {
			'$set': {
				'long_terms.$.student_answers': [],
				'long_terms.$.status': 'corrected'
			}
		};
		update_push_query = {
			'$push': {
				'long_terms.$.student_answers': {
					'$each': new_student_answers
				}
			}
		}
		console.info('update_pull_query : ' + JSON.stringify(update_pull_query));
		console.info('update_push_query : ' + JSON.stringify(update_push_query));
	} else if (req.body.event_id) {
		//Find long_terms index in req.session.volunteer to apply to mongo search (DANGEROUS BUT AFTER MULTIPLE HOURS .........)
		console.info('We are starting to update answers to an event');
		find_query = {
			'_id': req.session.volunteer._id,
			'events._id': req.body.event_id
		}
		update_pull_query = {
			'$set': {
				'events.$.student_answers': [],
				'events.$.status': 'corrected'
			}
		};
		update_push_query = {
			'$push': {
				'events.$.student_answers': {
					'$each': new_student_answers
				}
			}
		}
		console.info('update_pull_query : ' + JSON.stringify(update_pull_query));
		console.info('update_push_query : ' + JSON.stringify(update_push_query));
	} else if (req.body.ext_id) {
		//Find long_terms index in req.session.volunteer to apply to mongo search (DANGEROUS BUT AFTER MULTIPLE HOURS .........)
		console.info('We are starting to update answers to an extra');
		find_query = {
			'_id': req.session.volunteer._id,
			'extras._id': req.body.ext_id
		}
		update_pull_query = {
			'$set': {
				'extras.$.student_answers': [],
				'extras.$.status': 'corrected'
			}
		};
		update_push_query = {
			'$push': {
				'extras.$.student_answers': {
					'$each': new_student_answers
				}
			}
		}
		console.info('update_pull_query : ' + JSON.stringify(update_pull_query));
		console.info('update_push_query : ' + JSON.stringify(update_push_query));
	}
	//PULL STUDENT ANSWERS FROM THE CORRESPONDING FIELD
	Volunteer.findOneAndUpdate(find_query, update_pull_query, function(err) {
		if (err) {
			err.type = 'CRASH';
			err.print = 'Problème lors de la mise à jour des questions';
			next(err);
		} else {
			//push STUDENT ANSWERS FROM THE CORRESPONDING FIELD
			Volunteer.findOneAndUpdate(find_query, update_push_query, {
				new: true
			}, function(err, new_volunteer) {
				if (err) {
					err.type = 'CRASH';
					err.print = 'Problème lors de la mise à jour des questions';
					next(err);
				} else {
					if (new_volunteer) {
						req.session.volunteer = new_volunteer;
						req.session.save(function() {
							console.info('SUCCESS in updating answers with update_push_query : ' + JSON.stringify(update_push_query));
							res.redirect(req.body.url);
						});
					} else {
						console.error('ERR : aucun élève trouvé with find_query : ' + JSON.stringify(find_query));
						res.redirect(req.body.url + '?error=' + encodeURIComponent('Il y a eu une erreur lors de l\'opération'));
					}
				}
			})
		}
	})
});

module.exports = router;