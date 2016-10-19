var express = require('express');
var schedule = require('node-schedule');

let rule = new schedule.RecurrenceRule();
rule.minute = Math.floor(Math.random()*(50)) + 5;
rule.hour = Math.floor(Math.random()*(16-10)) + 10;