'use strict';
const express = require('express');
const fs = require('fs');

const getSchoolList = function(path, callback){
	console.info('INFO: Enter getSchoolList');
	fs.readFile(path, 'utf8', function(err, file){
		console.info('INFO: Enter readFile');
		if(err){
			console.error(err);
			return callback(err, null);
		} else {
			const theList = file.split('\n');
			return callback(null, theList);
		}
	})
};

module.exports = {
	getSchoolList
};