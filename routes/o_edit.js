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

router.post('/edit-longterm', permissions.requireGroup('organism'), function(req, res){
	console.info('req.body : ' + JSON.stringify(req.body));
	res.redirect(req.body.url);
});

module.exports = router;