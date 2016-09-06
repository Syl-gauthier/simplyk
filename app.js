/*jslint node: true */

require('newrelic');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var flash = require('connect-flash');

//Auth
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//Routes files
var a_routes = require('./routes/a_index');
var o_routes = require('./routes/o_index');
var users = require('./routes/users');
var o_addevent = require('./routes/o_addevent');
var o_profile = require('./routes/o_profile');
var g_auth = require('./routes/g_auth');
var v_routes = require('./routes/v_index');
var v_profile = require('./routes/v_profile');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('./models/organism_model.js');
var Volunteer = require('./models/volunteer_model.js');
var Admin = require('./models/admin_model.js');

var app = express();
app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//connect to mongo
var db_credentials = process.env.MONGO_DB_CREDENTIALS;
if(typeof db_credentials === 'undefined'){
  console.log("DB credentials not defined, use test DB localhost/test");
  db_credentials = 'localhost/test';
}

mongoose.connect('mongodb://'+db_credentials);

passport.use('local-volunteer', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
function(email, password, done) {
  Volunteer.findOne({email: email}, function (err, volunteer) {
    if(err) { 
      return done(err); 
    }
    else if(!volunteer) {
      return done(null, false, { message: 'Incorrect mail.' });
    }
    else if(!volunteer.validPassword(password)) {
      return done(null, false, { exists: true, message: 'Incorrect password.', code: 1});
    }
    else if(volunteer.email_verified == false) {
      console.log('User not verified');
      return done(null, false, { exists: true, message: 'email not verified', code: 2});
    }
    else{
      //Login info correct
      volunteer = volunteer.toJSON();
      volunteer.group = "volunteer";
      return done(null, volunteer);
    }
  });
}
));

passport.use('local-organism', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
function(email, password, done) {
  Organism.findOne({email: email}, function (err, org) {
    if(err) { 
      return done(err);
    }
    else if(!org) {
      return done(null, false, { message: 'Incorrect mail.' });
    }
    else if(!org.validPassword(password)) {
      return done(null, false, { exists: true, message: 'Incorrect password.', code: 1});
    }
    else if(org.email_verified == false) {
      console.log('User not verified');
      return done(null, false, { exists: true, message: 'email not verified', code: 2});
    }
    else{
      //Login info correct
      org = org.toJSON();
      org.group = "organism";
      return done(null, org);
    }
  });
}
));

passport.use('local-admin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
function(email, password, done) {
  Admin.findOne({email: email}, function (err, admin) {
    if (err) { return done(err); }
    if (!admin) {
      return done(null, false, { message: 'Incorrect mail.' });
    }
    if (!admin.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    admin = admin.toJSON();
    admin.group = "admin";
    return done(null, admin);
  });
}
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(req, id, done) {
  console.log("Deserialize");

  if(req.session.group == "volunteer"){
    Volunteer.findById(id, function(err, volunteer) {
      //console.log(volunteer.toJSON())
      done(err, volunteer);
    });
  }
  else if(req.session.group == "organism"){
    Organism.findById(id, function(err, org){
      done(err, org);
    });
  }
  else if(req.session.group == "admin"){
    Admin.findById(id, function(err, admin){
      done(err, admin);
    });
  }
  else{
    done(null, false);
  }
});

app.use(session({
  cookieName: 'session',
  secret: 'rcmscgsamfon81152627lolmamparohu,,loui',
  activeDuration: 1500 * 60 * 1000
}));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', a_routes);
app.use('/', o_routes);
//app.use('/', users);
app.use('/', g_auth);
app.use('/', o_profile);
app.use('/', o_addevent);
app.use('/', v_routes);
app.use('/', v_profile);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('g_error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('g_error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
