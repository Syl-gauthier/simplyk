'use strict';
var express = require('express');
var Organism = require('../../models/organism_model.js');
var Volunteer = require('../../models/volunteer_model.js');
var Activity = require('../../models/activity_model.js');
var OrgTodo = require('../../models/o_todo_model.js');



const removeActivity = function(activity_id, callback) {
	//Remove events from volunteer C
	Volunteer.update({
		'events.activity_id': activity_id
	}, {
		'$pull': {
			'events': {
				'activity_id': activity_id
			}
		}
	}, {
		'multi': true
	}, function(err, response) {
		if (err) {
			console.log('ERR : ' + JSON.stringify(err));
			return callback(err);
		} else { 
			console.log('Events from volunteer removed ! Response : ' + JSON.stringify(response));
			//Check if we delete only the activity (if other_activities) or the entire event
			Organism.findOne({
				'events.activities': activity_id
			}, function(err, organism) {
				if (err) {
					console.log('ERR : ' + JSON.stringify(err));
					return callback(err);
				} else {
					if (organism) {
						const event_containing_activity_to_delete = organism.events.find(ev => {
							return (ev.activities.indexOf(activity_id) > -1);
						});
						console.info('event_containing_activity_to_delete : ' + event_containing_activity_to_delete);
						let org_update = {};
						console.log('The event contains ' + event_containing_activity_to_delete.activities.length + ' activities !')
						if (event_containing_activity_to_delete.activities.length > 1) {
							console.info('The event contains multiple activities so we will only remove the activity');
							org_update = {
								'$pull': {
									'events.$.activities': activity_id

								}
							};
						} else {
							console.info('The event contains just one activity so we will remove the entire event');
							org_update = {
								'$pull': {
									'events': {
										'activities': activity_id
									}
								}
							};
						}
						console.log('Organism found ! Response : ' + JSON.stringify(response));
						//Remove events from organism
						Organism.update({
							'events.activities': activity_id
						}, org_update, function(err, response) {
							if (err) {
								console.log('ERR : ' + JSON.stringify(err));
								return callback(err);
							} else {
								console.log('Organism updated ! Response : ' + JSON.stringify(response));
								//Remove Activity
								Activity.remove({
									'_id': activity_id
								}, function(err, response) {
									if (err) {
										console.log('ERR : ' + JSON.stringify(err));
										return callback(err);
									} else {
										console.log('Activitity removed ! Response : ' + JSON.stringify(response));
										//Remove org_todo
										OrgTodo.remove({
											'activity_id': activity_id
										}, function(err, response) {
											if (err) {
												console.log('ERR : ' + JSON.stringify(err));
												return callback(err);
											} else {
												console.log('OrgToDos deleted ! Response : ' + JSON.stringify(response));
												return callback(null);
											}
										})
									}
								})
							}
						})

					} else {
						console.log('ERR : NO Organism found');
						return callback('NO Organism found');
					}
				}
			})
		}
	})
};

module.exports = {
	removeActivity
}