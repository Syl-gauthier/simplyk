'use strict';
const express = require('express');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Admin = require('../models/admin_model.js');

const getQuestions = function(admin) {
	//admin is corresponding to the volunteer one : volunteer.admin = {school_name, school_id, class}
	let results = {};
	const default_questions = {
		organism_questions: ['Quel point positif pouvez-vous mettre en avant sur l’élève, et qu’est-ce que l’élève pourrait améliorer ?'],
		student_questions: ['Quel est le but du travail de l’organisme?', 'Identifie une qualité du profil de l’apprenant que tu as développé au cours de cet engagement et explique pourquoi.', 'Comment pourrais-tu prolonger ton expérience de bénévolat ?']
	};
	if (admin.school_id) {
		Admin.findById(admin.school_id, function(err, admin) {
			if (err) {
				console.error('ERROR : try getQuestions but admin with school_id doesn\'t exist');
				return default_questions;
			} else if (typeof admin.questions == undefined) {
				console.info('INFO : try to get questions but the admin ' + admin.name + ' has not specific questions');
				return default_questions;
			} else {
				console.info('SUCCESS : we will send questions from admin ' + admin.name);
				return admin.questions;
			}
		})


	} else {
		return default_questions;
	}
};

module.exports = {
	getQuestions
}