/*jslint node: true */
'use strict';

var express = require('express');
var router = express.Router();

var Intercom = require('intercom-client');
var emailer = require('../email/emailer.js');
var client = new Intercom.Client({
    token: process.env.INTERCOM_TOKEN
});

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var longtermsList = require('../lib/longterms.js').listFromOrganisms;
var rewindSlotString = require('../lib/slot.js').rewindSlotString;

var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');
var OrgTodo = require('../models/o_todo_model.js');

var app = express();

var opp_management = require('../middlewares/opp_management.js');


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('Organism index');
    Activity.find({}, function(err, activities) {
        if (err) {
            console.error(err);
            res.render('g_accueil.jade', {
                session: req.session,
                error: err,
                group: req.session.group
            });
        }
        //Create events list
        else {
            console.info('req.isAuthenticated() : ' + req.isAuthenticated());
            console.info('**************');
            if (req.session) {
                if (req.session.group == 'organism') {
                    console.warn('Try to access / but req.session.organism');
                    res.redirect('/organism/dashboard');
                } else if (req.session.group == 'volunteer') {
                    console.warn('Try to access / but req.session.volunteer');
                    res.redirect('/volunteer/map');
                } else if (req.session.group == 'admin') {
                    console.warn('Try to access / but req.session.admin');
                    res.redirect('/admin/classes');
                } else {
                    var isNotPassed = function(activity) {
                        var days_length = activity.days.filter(function(day) {
                            return day.day > Date.now();
                        });
                        return days_length.length > 0;
                    };
                    var isNotASchool = function(activity) {
                        return !(activity.school_id);
                    };
                    const acts = activities.filter(isNotPassed).filter(isNotASchool);
                    const favorites = acts.reduce(function(pre, cur, ind, arr) {
                        console.info('cur.intitule ' + cur.intitule + ' & cur.favorite : ' + cur.favorite);
                        if (cur.favorite) {
                            pre.push(cur);
                            return pre;
                        } else {
                            return pre;
                        }
                    }, []);
                    const fav_index = Math.floor(Math.random() * (favorites.length));
                    console.info('favorites.length : ' + favorites.length);
                    console.info('fav_index : ' + fav_index);
                    let the_favorite = {};
                    if (favorites.length != 0) {
                        the_favorite = favorites[fav_index];
                    } else {
                        the_favorite = acts[Math.floor(Math.random() * (acts.length))];
                        console.info('INFO : There was no favorites so the random fav is ' + the_favorite.org_name + ', ' + the_favorite.intitule);
                    }
                    //Select organisms who have longterms and are not admin ones
                    Organism.find({
                        'long_terms': {
                            '$exists': true,
                            '$not': {
                                '$size': 0
                            }
                        }
                    }, {
                        'org_name': true,
                        'cause': true,
                        '_id': true,
                        'long_terms': true,
                        'school_id': true,
                        'admin_id': true
                    }, function(err, organisms) {
                        if (err) {
                            console.error(err);
                            res.render('g_accueil.jade', {
                                session: req.session,
                                error: err,
                                organism: req.session.organism,
                                group: req.session.group
                            });
                        } else {
                            //Get the longterms from all the organisms which are not a school
                            var longterms = longtermsList(organisms.filter(function(orga) {
                                if (orga.school_id || orga.admin_id) {
                                    return false;
                                } else {
                                    return true;
                                }
                            }));
                            res.render('g_accueil.jade', {
                                activities: acts,
                                the_favorite: the_favorite,
                                session: req.session,
                                longterms: longterms,
                                error: req.query.error,
                                group: req.session.group
                            });
                        }
                    });
                }
            } else {
                var isNotPassed = function(activity) {
                    var days_length = activity.days.filter(function(day) {
                        return day.day > Date.now();
                    });
                    return days_length.length > 0;
                };
                const actis = activities.filter(isNotPassed);
                res.render('g_accueil.jade', {
                    activities: actis,
                    session: req.session,
                    error: req.query.error,
                    group: req.session.group
                });
            }
        }
    });
});

router.get('/organism/dashboard', permissions.requireGroup('organism', 'admin'), function(req, res) {
    console.info('req.body : ' + req.body);
    if (req.body.org) {
        req.session.organism = req.body.org;
        console.info('organism refreshed !');
    }
    Activity.find({
        'org_id': req.session.organism._id
    }, function(err, activities) {
        if (err) {
            console.error(err);
            res.render('g_accueil.jade', {
                session: req.session,
                error: err,
                organism: req.isAuthenticated(),
                group: req.session.group
            });
        } else {
            var events = req.session.organism.events;
            var ev_past = [];
            var ev_to_come = [];
            for (var eventI = events.length - 1; eventI >= 0; eventI--) {
                events[eventI].acts = [];
                console.info('******************');

                function inThisEvent(activity) {
                    return (events[eventI].activities.indexOf(activity._id.toString()) >= 0);
                }
                var these_activities = activities.filter(inThisEvent);
                console.info('In the event ' + events[eventI]._id + 'where activitieslist is :' + events[eventI].activities + ' , the activities are : ' + these_activities);
                Array.prototype.push.apply(events[eventI].acts, these_activities);
                var lastDay = events[eventI].dates[0];
                for (var dateI = events[eventI].dates.length - 1; dateI >= 0; dateI--) {
                    if (Date.parse(events[eventI].dates[dateI]) > Date.parse(lastDay)) {
                        lastDay = events[eventI].dates[dateI];
                    }
                }
                console.info('LastDay of the event : ' + lastDay);
                if (Date.parse(lastDay) > Date.now()) {
                    ev_to_come.push(events[eventI]);
                } else if (Date.parse(lastDay) < Date.now()) {
                    ev_past.push(events[eventI]);
                }
            }
            console.info('ev_past : ' + ev_past + ' ev_to_come :' + JSON.stringify(ev_to_come));
            //Find TODO
            OrgTodo.find({
                org_id: req.session.organism._id
            }, function(err, todos) {
                if (err) {
                    console.error(err);
                    res.render('g_accueil.jade', {
                        session: req.session,
                        error: err,
                        organism: req.session.organism,
                        group: req.session.group
                    });
                } else {
                    function addEventName(td) {
                        if (td.type == 'hours_pending') {
                            var todo = JSON.parse(JSON.stringify(td));
                            todo.event_name = null;

                            function containsActivity(event) {
                                var isIt = event.activities.find(function(act) {
                                    if (act.$oid) {
                                        return act.$oid.toString() == todo.activity_id.toString();
                                    } else {
                                        return false;
                                    }
                                });
                                if (isIt == -1) {
                                    return false;
                                } else {
                                    return true;
                                }
                            }
                            const theEvent = req.session.organism.events.find(containsActivity);
                            console.info('theEvent : ' + theEvent);
                            todo.event_name = theEvent.intitule;
                            return todo;
                        } else {
                            return td;
                        }
                    }
                    var lastTodos = todos.map(addEventName);
                    res.render('o_dashboard.jade', {
                        ev_past: ev_past,
                        error: req.query.error,
                        ev_to_come: ev_to_come,
                        session: req.session,
                        organism: req.session.organism,
                        todos: lastTodos,
                        group: req.session.group
                    });
                }
            });
        }
    });
});

router.get('/organism/event/:event_id', permissions.requireGroup('organism', 'admin'), function(req, res) {
    function isEvent(event) {
        console.info('Test : ' + event._id + ' = ' + req.params.event_id + ' ?');
        return event._id.toString() === req.params.event_id;
    }
    var event = req.session.organism.events.find(isEvent);
    if (event) {
        var acts_id = event.activities;
        Activity.find({
            '_id': {
                '$in': acts_id
            }
        }, function(err, activities) {
            if (err) {
                console.error(err);
                res.redirect('/organism/dashboard?error=' + err);
            } else {
                Volunteer.find({
                    'events': {
                        '$elemMatch': {
                            'activity_id': {
                                '$in': acts_id
                            }
                        }
                    }
                }, function(err, volunteers) {
                    if (err) {
                        console.error(err);
                        res.redirect('/organism/dashboard?error=' + err);
                    } else {
                        var activities_list = activities;
                        console.info('ALL ACTIVITIES : ' + activities_list);
                        console.info('****************************');
                        console.info('ALL VOLUNTEERS : ' + volunteers);
                        console.info('****************************');
                        event.acts = [];
                        for (var actI = activities_list.length - 1; actI >= 0; actI--) {
                            for (var daysI = activities_list[actI].days.length - 1; daysI >= 0; daysI--) {
                                activities_list[actI].days[daysI].vols = [];
                                var vols = [];
                                console.info('activities_list[actI] : ' + activities_list[actI].days[daysI]);
                                console.info('**************');

                                function goodEvent(event) {
                                    console.info('blop');
                                    console.info('event.activity_id : ' + event.activity_id.toString());
                                    console.info('activities_list[actI]._id : ' + activities_list[actI]._id.toString());
                                    console.info('event.activity_id === activities_list[actI]._id : ' + (event.activity_id.toString() === activities_list[actI]._id.toString()));
                                    return ((event.activity_id.toString() === activities_list[actI]._id.toString()) && (Date.parse(event.day) === Date.parse(activities_list[actI].days[daysI].day)));
                                }

                                function isParticipating(volunteer) {
                                    console.info('volunteer.events : ' + volunteer.events);
                                    var result = volunteer.events.find(goodEvent);
                                    console.info('result : ' + result);
                                    return typeof result !== 'undefined';
                                }
                                var these_volunteers = volunteers.filter(isParticipating);
                                console.info('these_volunteers : ' + these_volunteers);


                                Array.prototype.push.apply(activities_list[actI].days[daysI].vols, these_volunteers);
                                console.info('activities_list[actI] avec vols : ' + activities_list[actI]);
                                console.info('activities_list[actI].vols : ' + activities_list[actI].days[daysI].vols);
                            }
                        }


                        Array.prototype.push.apply(event.acts, activities_list);
                        //res.json(event);
                        res.render('o_event.jade', {
                            session: req.session,
                            event: event,
                            organism: req.session.organism,
                            group: req.session.group
                        });
                    }
                });
            }
        });
    } else {
        const err = 'Évènement non trouvé';
        res.redirect('/organism/dashboard?error=' + err);

    }
});


router.get('/organism/longterm/:lt_id', permissions.requireGroup('organism', 'admin'), function(req, res) {
    console.info('In GET to a longterm page with lt_id:' + req.params.lt_id);
    var organism = req.session.organism;

    function isRightLongterm(long) {
        console.info('long._id == req.params.lt_id : ' + (long._id.toString() == req.params.lt_id) + long._id + '  ' + req.params.lt_id);
        return long._id.toString() == req.params.lt_id;
    }
    var longterm = organism.long_terms.find(isRightLongterm);
    console.info('+++++++++++++++++++++');
    console.info('Longterm corresponding to lt_id : ' + longterm);
    console.info('+++++++++++++++++++++');
    if (longterm) {
        Volunteer.find({
            'long_terms': {
                '$elemMatch': {
                    '_id': {
                        '$in': req.params.lt_id
                    }
                }
            }
        }, {
            'email': 1,
            'long_terms.$': 1,
            'firstname': 1,
            'lastname': 1,
            'birthdate': 1,
            'phone': 1
        }, function(err, volunteers) {
            if (err) {
                console.error(err);
                res.redirect('/organism/dashboard?error=' + err);
            } else {
                var slotJSON = rewindSlotString(longterm.slot);
                res.render('o_longterm.jade', {
                    session: req.session,
                    lt_id: req.params.lt_id,
                    organism: organism,
                    longterm: longterm,
                    slotJSON: slotJSON,
                    volunteers: volunteers,
                    group: req.session.group
                });
                res.end();
            }
        });
    } else {
        const err = 'Engagement non disponible';
        res.redirect('/organism/dashboard?error=' + err);
    }
});


router.post('/organism/correcthours', permissions.requireGroup('organism', 'admin'), function(req, res) {
    console.info('Correct Hours starts');
    const correct_hours = req.body.correct_hours;
    console.info('Correct_hours: ' + correct_hours);
    Volunteer.findOne({
        _id: req.body.vol_id
    }, function(err, myVolunteer) {
        if (err) {
            console.error(err);
            res.sendStatus(404);
        } else if (myVolunteer) {
            var type = req.body.type;
            console.info('myvolunteer exists');
            console.info('MyVolunteer : ' + JSON.stringify(myVolunteer));
            if (typeof req.body.act_id !== 'undefined') {
                console.info('Correct hours for an activity !');
                if (type == 'hours_pending') {
                    const theactivity = myVolunteer.events.find(function(event) {
                        return event.activity_id.toString() == req.body.act_id.toString();
                    });
                    var activity_name = theactivity.intitule;
                    var query = {
                        '_id': req.body.vol_id,
                        'events': {
                            '$elemMatch': {
                                'activity_id': req.body.act_id,
                                'day': req.body.day
                            }
                        }
                    };
                } else if (type == 'students_hours_pending') {
                    const theactivity = myVolunteer.extras.find(function(event) {
                        return event._id.toString() == req.body.act_id.toString();
                    });
                    var activity_name = theactivity.intitule;
                    var query = {
                        '_id': req.body.vol_id,
                        'extras': {
                            '$elemMatch': {
                                'activity_id': req.body.act_id
                            }
                        }
                    };
                }
                if (req.body['answers[0][value]']) {
                    console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
                    //i starts from 1 to avoid to select the number answered as corrected hours
                    var i = 1;
                    var answers = [];
                    while (req.body['answers[' + i + '][value]']) {
                        console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                        answers.push(req.body['answers[' + i + '][value]']);
                        i++;
                    }
                    console.info('Answers : ' + JSON.stringify(answers));
                    if (type == 'hours_pending') {
                        var update = {
                            '$set': {
                                'events.$.hours_done': correct_hours,
                                'events.$.hours_pending': 0,
                                'events.$.status': 'confirmed',
                                'events.$.organism_answers': answers
                            }
                        };
                    } else if (type == 'students_hours_pending') {
                        var update = {
                            '$set': {
                                'extras.$.hours_done': correct_hours,
                                'extras.$.hours_pending': 0,
                                'extras.$.status': 'confirmed',
                                'extras.$.organism_answers': answers
                            }
                        };
                    }
                } else {
                    if (type == 'hours_pending') {
                        var update = {
                            '$set': {
                                'events.$.hours_done': correct_hours,
                                'events.$.hours_pending': 0,
                                'events.$.status': 'confirmed'
                            }
                        };
                    } else if (type == 'students_hours_pending') {
                        var update = {
                            '$set': {
                                'extras.$.hours_done': correct_hours,
                                'extras.$.hours_pending': 0,
                                'extras.$.status': 'confirmed'
                            }
                        };
                    }

                }
            } else if (typeof req.body.lt_id !== 'undefined') {
                console.info('Correct hours for a longterm !');
                var query = {
                    '_id': req.body.vol_id,
                    'long_terms': {
                        '$elemMatch': {
                            '_id': req.body.lt_id
                        }
                    }
                };
                //Check if hours_pending different from 0 (meaning OrgTodo already done)
                const thelt = myVolunteer.long_terms.find(function(lt) {
                    return lt._id.toString() == req.body.lt_id;
                });
                var activity_name = thelt.intitule;
                if (thelt.hours_pending >= req.body.hours_before) {
                    var already_done = false;
                } else {
                    var already_done = true;
                }
                if (req.body['answers[0][value]']) {
                    console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
                    //i starts from 1 to avoid to select the number answered as corrected hours
                    var i = 1;
                    var answers = [];
                    while (req.body['answers[' + i + '][value]']) {
                        console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                        answers.push(req.body['answers[' + i + '][value]']);
                        i++;
                    }
                    console.info('Answers : ' + JSON.stringify(answers));
                    var update = {
                        '$inc': {
                            'long_terms.$.hours_done': correct_hours,
                            'long_terms.$.hours_pending': -req.body.hours_before
                        },
                        '$set': {
                            'long_terms.$.status': 'confirmed',
                            'long_terms.$.organism_answers': answers
                        }
                    };
                } else {
                    var update = {
                        '$inc': {
                            'long_terms.$.hours_done': correct_hours,
                            'long_terms.$.hours_pending': -req.body.hours_before
                        },
                        '$set': {
                            'long_terms.$.status': 'confirmed'
                        }
                    };
                }
            }
            console.info('query : ' + JSON.stringify(query));
            console.info('update : ' + JSON.stringify(update));
            if (!already_done) {
                Volunteer.findOneAndUpdate(query, update, function(err) {
                    if (err) {
                        console.error(err);
                        res.sendStatus(404);
                    } else {
                        //Intercom create addlongterm event
                        client.events.create({
                            event_name: 'org_correcthours',
                            created_at: Math.round(Date.now() / 1000),
                            user_id: req.session.organism._id,
                            metadata: {
                                act_id: req.body.act_id,
                                lt_id: req.body.lt_id
                            }
                        });
                        client.users.update({
                            user_id: req.session.organism._id,
                            update_last_request_at: true
                        });
                        //Send email to felicitate the volunteer
                        emailer.sendHoursConfirmedVolEmail({
                            firstname: myVolunteer.firstname,
                            recipient: myVolunteer.email,
                            activity_name: activity_name,
                            customMessage: req.session.organism.org_name + ' vient de valider ta participation de ' + correct_hours + ' h (nombre d\'heures corrigés par l\'organisme) à ' + activity_name + ' !'
                        });
                        OrgTodo.findOneAndRemove({
                            _id: req.body.todo
                        }, function(err, todoremoved) {
                            if (err) {
                                console.error(err);
                            } else {
                                console.info('todoremoved : ' + todoremoved);
                            }
                        });
                        console.info('Hours_pending goes to hours_done with corrected_hours : ' + req.body.correct_hours);
                        res.sendStatus(200);
                    }
                });
            } else {
                console.error('ERR : It seems that the todo has already been done since the hours_pending in volunteer is less than the hours in the TODO');
                res.sendStatus(404);
            }
        } else {
            console.warn('MyVolunteer doesnt exist');
            res.sendStatus(404);
        }
    });
});

router.post('/organism/confirmhours', permissions.requireGroup('organism', 'admin'), function(req, res) {
    console.info('Confirm Hours starts');
    Volunteer.findOne({
        _id: req.body.vol_id
    }, function(err, myVolunteer) {
        if (err) {
            console.error(err);
            res.redirect('/organism/dashboard?error=' + err);
        } else if (myVolunteer) {
            console.info('myvolunteer exists');
            console.info('MyVolunteer : ' + JSON.stringify(myVolunteer.email));
            var type = req.body.type;
            var hours_pending = req.body.hours;
            console.info('hours_pending : ' + hours_pending);
            console.info('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
            var update = {};
            //Intercom create addlongterm event
            client.events.create({
                event_name: 'org_confirmhours',
                created_at: Math.round(Date.now() / 1000),
                user_id: req.session.organism._id,
                metadata: {
                    act_id: req.body.act_id,
                    lt_id: req.body.lt_id
                }
            });
            client.users.update({
                user_id: req.session.organism._id,
                update_last_request_at: true
            });
            //If we deal with an event
            if (req.body.act_id) {
                if (type == 'hours_pending') {
                    var activity_name = (myVolunteer.events.find(function(eve) {
                        return eve.activity_id.toString() == req.body.act_id.toString();
                    })).intitule;
                    var query = {
                        '_id': req.body.vol_id,
                        'events': {
                            '$elemMatch': {
                                'activity_id': req.body.act_id,
                                'day': req.body.day
                            }
                        }
                    };
                } else if (type == 'students_hours_pending') {
                    var activity_name = (myVolunteer.extras.find(function(eve) {
                        return eve._id.toString() == req.body.act_id.toString();
                    })).intitule;
                    var query = {
                        '_id': req.body.vol_id,
                        'extras': {
                            '$elemMatch': {
                                '_id': req.body.act_id
                            }
                        }
                    };
                }
                //If we deal with a student
                if (req.body['answers[0][value]']) {
                    console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
                    var i = 0;
                    var answers = [];
                    while (req.body['answers[' + i + '][value]']) {
                        console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                        answers.push(req.body['answers[' + i + '][value]']);
                        i++;
                    }
                    console.info('Answers : ' + JSON.stringify(answers));
                    if (type == 'hours_pending') {
                        var update = {
                            '$set': {
                                'events.$.hours_done': hours_pending,
                                'events.$.hours_pending': 0,
                                'events.$.status': 'confirmed',
                                'events.$.organism_answers': answers
                            }
                        };
                    } else if (type == 'students_hours_pending') {
                        var update = {
                            '$set': {
                                'extras.$.hours_done': hours_pending,
                                'extras.$.hours_pending': 0,
                                'extras.$.status': 'confirmed',
                                'extras.$.organism_answers': answers
                            }
                        };
                    }
                } else {
                    if (type == 'hours_pending') {
                        var update = {
                            '$set': {
                                'events.$.hours_done': hours_pending,
                                'events.$.hours_pending': 0,
                                'events.$.status': 'confirmed'
                            }
                        };
                    } else if (type == 'students_hours_pending') {
                        var update = {
                            '$set': {
                                'extras.$.hours_done': hours_pending,
                                'extras.$.hours_pending': 0,
                                'extras.$.status': 'confirmed'
                            }
                        };
                    }
                    console.info('NO answers');

                }
                //If we deal with a longterm
            } else if (req.body.lt_id) {
                var activity_name = (myVolunteer.long_terms.find(function(lt) {
                    return lt._id.toString() == req.body.lt_id.toString();
                })).intitule;
                var query = {
                    '_id': req.body.vol_id,
                    'long_terms': {
                        '$elemMatch': {
                            '_id': req.body.lt_id
                        }
                    }
                };
                //If we deal with a student
                if (req.body['answers[0][value]']) {
                    console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
                    var i = 0;
                    var answers = [];
                    while (req.body['answers[' + i + '][value]']) {
                        console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                        answers.push(req.body['answers[' + i + '][value]']);
                        i++;
                    }
                    console.info('Answers : ' + JSON.stringify(answers));
                    var update = {
                        '$inc': {
                            'long_terms.$.hours_done': hours_pending,
                            'long_terms.$.hours_pending': -hours_pending
                        },
                        '$set': {
                            'long_terms.$.status': 'confirmed',
                            'long_terms.$.organism_answers': answers
                        }
                    };
                } else {
                    console.info('NO answers');
                    var update = {
                        '$inc': {
                            'long_terms.$.hours_done': hours_pending,
                            'long_terms.$.hours_pending': -hours_pending
                        },
                        '$set': {
                            'long_terms.$.status': 'confirmed'
                        }
                    };
                }
            }

            //Send email to felicitate the volunteer
            emailer.sendHoursConfirmedVolEmail({
                firstname: myVolunteer.firstname,
                recipient: myVolunteer.email,
                activity_name: activity_name,
                customMessage: req.session.organism.org_name + ' vient de valider ta participation de ' + hours_pending + ' h à ' + activity_name + ' !'
            });
            Volunteer.findOneAndUpdate(query, update, function(err) {
                if (err) {
                    console.error(err);
                    res.sendStatus(404);
                } else {
                    console.info('Hours_pending goes to hours_done : ' + hours_pending);
                    console.info(req.body);
                    OrgTodo.findOneAndRemove({
                        _id: req.body.todo
                    }, function(err, todoremoved) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.info('todoremoved : ' + todoremoved);
                        }
                    });
                    res.sendStatus(200);
                }
            });
        } else {
            console.warn('MyVolunteer doesnt exist');
            res.sendStatus(404);
        }
    });
});

router.get(/dashboard/, permissions.requireGroup('organism', 'admin'), function(req, res) {
    res.redirect('/dashboard');
});

module.exports = router;