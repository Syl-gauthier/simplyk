'use strict';
const express = require('express');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Admin = require('../models/admin_model.js');

function getQuestions(admin, callback) {
	//admin is corresponding to the volunteer one : volunteer.admin = {school_name, school_id, class}
	let results = {};
	const default_questions = {
		organism_questions: ['Quel point positif pouvez-vous mettre en avant sur l’élève, et qu’est-ce que l’élève pourrait améliorer ?'],
		student_questions: ['Quel est le but du travail de l’organisme?', 'Identifie une qualité du profil de l’apprenant que tu as développé au cours de cet engagement et explique pourquoi.', 'Comment pourrais-tu prolonger ton expérience de bénévolat ?']
	};
	if (admin.school_id) {
		Admin.findById(admin.school_id, function(err, admin) {
			console.info('typeof admin.question : ' + typeof admin.questions);
			if (err) {
				console.error('ERROR : try getQuestions but admin with school_id doesn\'t exist');
				return callback(default_questions);
			} else if (admin.questions.length <= 0) {
				console.info('INFO : try to get questions but the admin ' + admin.name + ' has not specific questions');
				return callback(default_questions);
			} else {
				console.info('typeof admin.question : ' + typeof admin.questions);
				console.info('SUCCESS : we will send questions from admin ' + admin.name);
				let result_questions = {};
				result_questions.organism_questions = default_questions.organism_questions;
				result_questions.student_questions = admin.questions;
				console.info('SUCCESS : and questions are ' + JSON.stringify(admin.questions));
				console.info('SUCCESS : and result_questions are ' + JSON.stringify(result_questions));
				return callback(result_questions);
			}
		})
	} else {
		return callback(default_questions);
	}
};

module.exports = {
	getQuestions
}