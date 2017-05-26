'use strict';
const express = require('express');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Admin = require('../../../models/admin_model.js');

function getQuestions(admin_in_volunteer, callback) {
  //admin is corresponding to the volunteer one : volunteer.admin = {school_name, school_id, class}
  let results = {};
  const default_questions = {
    organism_questions: ['Quel point positif pouvez-vous mettre en avant sur l’élève, et qu’est-ce que l’élève pourrait améliorer ?'],
    student_questions: ['Quel est le but du travail de l’organisme?', 'Identifie une qualité du profil de l’apprenant que tu as développé au cours de cet engagement et explique pourquoi.', 'Comment pourrais-tu prolonger ton expérience de bénévolat ?']
  };

  if (admin_in_volunteer.school_id) {
    Admin.findById(admin_in_volunteer.school_id, function(err, admin) {
      if (err) {
        console.error('ERROR : try getQuestions but admin with school_id doesn\'t exist');
        return callback(default_questions);
      } else if (admin.questions.length <= 0) {
        console.info('INFO : try to get questions but the admin ' + admin.name + ' has not specific questions');
        return callback(default_questions);
      } else {
        const question_of_the_student = admin.questions.find(function(question) {
          return question.classes.indexOf(admin_in_volunteer.class) > -1;
        });

        if (question_of_the_student === undefined) {
          return callback(default_questions);
        } else {
          console.info('SUCCESS : we will send specific questions from admin ' + admin.name + ' with class ' + admin_in_volunteer.class);
          results.organism_questions = (question_of_the_student.organism_questions.length > 0) ? question_of_the_student.organism_questions : default_questions.organism_questions;
          results.student_questions = (question_of_the_student.student_questions.length > 0) ? question_of_the_student.student_questions : default_questions.student_questions;
          return callback(results);
        }
      }
    })
  } else {
    return callback(default_questions);
  }
};

module.exports = {
  getQuestions
}