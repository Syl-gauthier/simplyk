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
}

module.exports = {
	createSlotString: createSlotString
};