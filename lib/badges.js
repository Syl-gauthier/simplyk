'use strict';
const Intercom = require('intercom-client');
const client = new Intercom.Client({
	token: process.env.INTERCOM_TOKEN
});

function getBadges(volunteer, lt_hours_done, events_hours_done, callback) {
	let badges = [1, 0, 0, 0, 404, 0];
	let bonus = [0, 0, 0, 0, 0, 0];
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
	} else {
		scores[1] = 45;
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

module.exports = {
	getBadges
}