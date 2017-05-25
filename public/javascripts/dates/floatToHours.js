'use strict';

const floatToHours = function(float) {
	const hours = Math.floor(float);
	const minutes = float - hours;
	return (hours + 'h' + (minutes == 0 ? '' : (minutes == 0.25 ? '15' : (minutes == 0.5 ? '30' : (minutes == 0.75 ? '45' : '')))));
};

module.exports = {
	floatToHours
}