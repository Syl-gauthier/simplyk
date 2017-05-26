var express = require('express');

//Slot creation from a json
var createSlotString = function(body) {
	const slotList = ['mondayAM', 'mondayPM', 'mondayEVE', 'tuesdayAM', 'tuesdayPM', 'tuesdayEVE', 'wednesdayAM', 'wednesdayPM', 'wednesdayEVE', 'thursdayAM', 'thursdayPM', 'thursdayEVE', 'fridayAM', 'fridayPM', 'fridayEVE', 'saturdayAM', 'saturdayPM', 'saturdayEVE', 'sundayAM', 'sundayPM', 'sundayEVE'];
	var slotString = slotList.reduce(function(pre, cur, ind, arr) {
		console.log('body[arr[ind]] : ' + body[arr[ind]])
		if(body[arr[ind]]){
			return pre + '1';
		} else {
			return pre + '0';
		}
	}, '');
	console.log('slotString created : ' + slotString)
	return slotString;
};

var rewindSlotString = function(slotString) {
	const slotList = ['mondayAM', 'mondayPM', 'mondayEVE', 'tuesdayAM', 'tuesdayPM', 'tuesdayEVE', 'wednesdayAM', 'wednesdayPM', 'wednesdayEVE', 'thursdayAM', 'thursdayPM', 'thursdayEVE', 'fridayAM', 'fridayPM', 'fridayEVE', 'saturdayAM', 'saturdayPM', 'saturdayEVE', 'sundayAM', 'sundayPM', 'sundayEVE'];
	const slotArray = slotString.split('');
	var slotJSONInit = JSON.parse('{}');
	slotArray.reduce(function(pre, cur, ind, arr) {
		console.log('arr[ind] : ' + arr[ind]);
		if(arr[ind]==0){
			return pre;
		} else if (arr[ind]==1){
			console.log('slotList[ind] : ' + slotList[ind]);
			slotJSONInit[slotList[ind]] = true
			return pre;
		} else {
			return pre;
		}
	}, slotJSONInit);
	console.log('slotJSON created : ' + JSON.stringify(slotJSONInit));
	return slotJSONInit;
}

module.exports = {
	createSlotString,
	rewindSlotString
};