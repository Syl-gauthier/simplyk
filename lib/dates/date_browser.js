'use strict';

const moment = require('moment');
moment.locale('fr');

function printDate(day){
	return moment.utc(day).format("dddd D MMMM YYYY");
}

module.exports = {
	printDate
};