'use strict';

const Volunteer = require('../../../models/volunteer_model.js');
const Organism = require('../../../models/organism_model.js');

const Intercom = require('intercom-client');
const client = new Intercom.Client({
	token: process.env.INTERCOM_TOKEN
});

function getBadges(volunteer, lt_hours_done, events_hours_done, callback) {
	let badges = [1, 0, 0, 0, 404, 0];
	let bonus = [5, 0, 0, 0, 0, 0];
	let scores = [0, 0, 0]; //hours, shares, sessions

	// POPULAIRE BADGE
	if (volunteer.shares < 2) {} else if (volunteer.shares < 4) {
		badges[1] = 1;
		bonus[1] = 5;
	} else if (volunteer.shares < 6) {
		badges[1] = 2;
		bonus[1] = 10;
	} else if (volunteer.shares < 8) {
		badges[1] = 3;
		bonus[1] = 20;
	} else if (volunteer.shares < 15) {
		badges[1] = 4;
		bonus[1] = 30;
	} else if (volunteer.shares > 15) {
		badges[1] = 5;
		bonus[1] = 50;
	}

	// SCORE FROM SHARE
	if (volunteer.shares < 15) {
		scores[1] = (volunteer.shares * 3);
	} else if (volunteer.shares > 14) {
		scores[1] = 45;
	} else {
		scores[1] = 0;
	}

	// MARATHONIAN BADGE
	if (lt_hours_done < 0.1) {} else if (lt_hours_done < 10) {
		badges[2] = 1;
		bonus[2] = 50;
	} else if (lt_hours_done < 30) {
		badges[2] = 2;
		bonus[2] = 100;
	} else if (lt_hours_done < 75) {
		badges[2] = 3;
		bonus[2] = 150;
	} else if (lt_hours_done < 150) {
		badges[2] = 4;
		bonus[2] = 200;
	} else if (lt_hours_done > 150) {
		badges[2] = 5;
		bonus[2] = 300;
	}

	// SCORE FROM HOURS
	if (lt_hours_done > 0) {
		scores[0] += (lt_hours_done * 10);
	};
	if (events_hours_done > 0) {
		scores[0] += (events_hours_done * 10);
	}

	// GOUROU BADGE
	if (lt_hours_done < 0.1 || events_hours_done < 0.1) {} else {
		const hours_done = lt_hours_done + events_hours_done;
		if (hours_done < 10) {
			bonus[3] = 50;
			badges[3] = 1;
		} else if (hours_done < 30) {
			bonus[3] = 100;
			badges[3] = 2;
		} else if (hours_done < 100) {
			bonus[3] = 150;
			badges[3] = 3;
		} else if (hours_done < 150) {
			bonus[3] = 200;
			badges[3] = 4;
		} else if (hours_done > 150) {
			bonus[3] = 300;
			badges[3] = 5;
		}
	}

	// SPRINTER BADGE
	if (events_hours_done < 0.1) {} else if (events_hours_done < 5) {
		bonus[5] = 50;
		badges[5] = 1;
	} else if (events_hours_done < 10) {
		bonus[5] = 100;
		badges[5] = 2;
	} else if (events_hours_done < 50) {
		bonus[5] = 150;
		badges[5] = 3;
	} else if (events_hours_done < 100) {
		bonus[5] = 200;
		badges[5] = 4;
	} else if (events_hours_done > 100) {
		bonus[5] = 300;
		badges[5] = 5;
	}

	client.users.find({
		user_id: volunteer._id
	}, function(err, d) {
		if (err) {
			console.error('ERROR : Error to get user in Intercom and print user badge ! : ' + err);
			return callback(err, {
				badges,
				bonus,
				scores
			});
		} else {
			console.log('Response from intercom for user : ' + JSON.stringify(d));
			const sessions = d.body.session_count;

			//SCORE FROM SESSION
			if (sessions > 0) {
				scores[2] += sessions;
			}

			// FAN BADGE
			if (sessions < 10) {
				badges[4] = 0;
			} else if (sessions < 20) {
				bonus[4] = 5;
				badges[4] = 1;
			} else if (sessions < 50) {
				bonus[4] = 10;
				badges[4] = 2;
			} else if (sessions < 100) {
				bonus[4] = 20;
				badges[4] = 3;
			} else if (sessions < 500) {
				bonus[4] = 30;
				badges[4] = 4;
			} else if (sessions > 500) {
				bonus[4] = 50;
				badges[4] = 5;
			}



			//SCORE CALCUL

			return callback(null, {
				badges,
				bonus,
				scores
			});

		}
	})
};

function refreshPreferences(vol, callback) {
	console.log('Start for vol : ' + vol.email);
	let new_preferences = [0.25, 0.25, 0.25, 0.25];
	let new_points = [0, 0, 0, 0];
	let p1 = new Promise(function(resolve) {
		if (vol.events.length > 0) {
			vol.events.map(function(ev, i) {
				console.log('Start for vol.ev : ' + ev.intitule);
				let cause_i = 0;
				let ev_number = vol.events.length;
				Organism.findOne({
					'_id': ev.org_id
				}, {
					cause: true
				}, function(err, org) {
					if (err) {
						console.error('ERROR : ' + err);
						return callback(err, null);
					} else {
						switch (org.cause) {
							case 'Solidarité':
								cause_i = 0
								break;
							case 'Nature':
								cause_i = 1
								break;
							case 'Sport et Culture':
								cause_i = 2
								break;
							case 'Enfance':
								cause_i = 3
								break;
						}

						console.error('On est là !');
						if (ev.status == 'past' || ev.status == 'subscribed') {
							new_points[cause_i] += 1;
						} else if (ev.status == 'confirmed' || ev.status == 'validated' || ev.status == 'corrected' || ev.status == 'denied') {
							if (ev.hours_done > 0) {
								new_points[cause_i] += (ev.hours_done) * 4;
							}
						} else if (ev.status == 'pending') {
							if (ev.hours_pending > 0) {
								new_points[cause_i] += (ev.hours_pending) * 2;
							}
						}
						console.log(vol.email + ' new_points : ' + new_points);
						if (i == (ev_number - 1)) {
							console.log(vol.email + ' new_points : ' + new_points);
							resolve();
						}
					}

				})
			});
		} else {
			resolve();
		}
	});

	p1.then(function() {
		let p2 = new Promise(function(resolve) {
			if (vol.long_terms.length > 0) {
				vol.long_terms.map(function(lt, i) {
					console.log('Start for vol.lt : ' + lt.intitule);
					let cause_i = 0;
					let lt_number = vol.long_terms.length;
					Organism.findOne({
						'_id': lt.org_id
					}, {
						cause: true
					}, function(err, org) {
						switch (org.cause) {
							case 'Solidarité':
								cause_i = 0
								break;
							case 'Nature':
								cause_i = 1
								break;
							case 'Sport et Culture':
								cause_i = 2
								break;
							case 'Enfance':
								cause_i = 3
								break;
						}

						new_points[cause_i] += 1;
						if (lt.hours_done > 0) {
							new_points[cause_i] += (lt.hours_done) * 4;
						}
						if (lt.hours_pending > 0) {
							new_points[cause_i] += (lt.hours_pending) * 2;
						}

						console.log(vol.email + ': ' + i + '/' + lt_number);
						if (i == (lt_number - 1)) {
							console.log(vol.email + ' new_points : ' + new_points);
							resolve();
						}
					});
				});

			} else {
				resolve()
			}
		});
		p2.then(function() {
			const total_points = new_points.reduce(function(tot, num) {
				return tot + num;
			});

			new_points.map(function(np, i) {
				if (total_points) {
					new_preferences[i] = (Math.round((np / total_points) * 100)) / 100;

				}
			});

			Volunteer.findOneAndUpdate({
				'_id': vol._id
			}, {
				'$set': {
					'preferences': new_preferences
				}
			}, {
				new: true
			}, function(err, vol) {
				if (err) {
					console.log('ERROR : ' + JSON.stringify(err));
					return callback(err, null);
				} else { 
					console.log(vol.email + ' (' + JSON.stringify(new_preferences) + ')');
					return callback(null, vol);
				}
			})
		});
	});
}

module.exports = {
	getBadges,
	refreshPreferences
}