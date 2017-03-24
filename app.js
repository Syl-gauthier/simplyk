/*jslint node: true */
require('newrelic');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);
var helmet = require('helmet');
var compression = require('compression');

//Auth
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//Routes files
var a_routes = require('./routes/a_index');
var o_routes = require('./routes/o_index');
var o_addevent = require('./routes/o_addevent');
var o_addlongterm = require('./routes/o_addlongterm');
var o_profile = require('./routes/o_profile');
var o_edit = require('./routes/o_edit');
var g_auth = require('./routes/g_auth');
var v_routes = require('./routes/v_index');
var v_profile = require('./routes/v_profile');
var g_nav = require('./routes/g_nav');
var g_editprofile = require('./routes/g_editprofile');
var g_profile = require('./routes/g_profile');
var v_student = require('./routes/v_student');

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
if (typeof db_credentials === 'undefined') {
  console.log("DB credentials not defined, use test DB localhost/test");
  db_credentials = 'localhost/test';
}

mongoose.connect('mongodb://' + db_credentials);


//Init agendas
require('./lib/agenda.js');

passport.use('local-volunteer', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    Volunteer.findOne({
      email: email
    }, function(err, volunteer) {
      if (err) {
        return done(err);
      } else if (!volunteer) {
        return done(null, false, {
          message: 'Incorrect mail.'
        });
      } else if (!volunteer.validPassword(password)) {
        return done(null, false, {
          exists: true,
          message: 'Incorrect password.',
          code: 1
        });
      } else if (volunteer.email_verified == false) {
        console.log('User not verified');
        return done(null, false, {
          exists: true,
          message: 'email not verified',
          code: 2
        });
      } else {
        //Login info correct
        volunteer = volunteer.toJSON();
        volunteer.group = "volunteer";
        return done(null, volunteer);
      }
    });
  }
));

passport.use('local-admin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    Admin.findOne({
      email: email
    }, function(err, admin) {
      if (err) {
        return done(err);
      } else if (!admin) {
        return done(null, false, {
          message: 'Incorrect mail.'
        });
      } else if (!admin.validPassword(password)) {
        return done(null, false, {
          exists: true,
          message: 'Incorrect password.',
          code: 1
        });
      } else {
        //Login info correct
        admin = admin.toJSON();
        admin.group = "admin";
        return done(null, admin);
      }
    });
  }
));

passport.use('local-organism', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    Organism.findOne({
      email: email
    }, function(err, org) {
      if (err) {
        return done(err);
      } else if (!org) {
        return done(null, false, {
          message: 'Incorrect mail.'
        });
      } else if (!org.validPassword(password)) {
        return done(null, false, {
          exists: true,
          message: 'Incorrect password.',
          code: 1
        });
      } else if (org.email_verified == false) {
        console.log('User not verified');
        return done(null, false, {
          exists: true,
          message: 'email not verified',
          code: 2
        });
      } else {
        //Login info correct
        org = org.toJSON();
        Admin.findOne({
          email: email
        }, function(err, admin) {
          if (err) {
            return done(err);
          } else if (!admin) {
            org.group = "organism";
            return done(null, org);
          } else if (!admin.validPassword(password)) {
            return done(null, false, {
              exists: true,
              message: 'Incorrect password.',
              code: 1
            });
          } else {
            //Login info correct
            admin = admin.toJSON();
            admin.group = "admin";
            return done(null, admin);
          }
        });
      }
    });
  }
));


passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(req, id, done) {
  console.log("Deserialize");

  if (req.session.group == "volunteer") {
    Volunteer.findById(id, function(err, volunteer) {
      //console.log(volunteer.toJSON())
      done(err, volunteer);
    });
  } else if (req.session.group == "organism") {
    Organism.findById(id, function(err, org) {
      done(err, org);
    });
  } else if (req.session.group == "admin") {
    Admin.findById(id, function(err, admin) {
      done(err, admin);
    });
  } else {
    done(null, false);
  }
});


app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'rcmscgsamfon81152627lolmamparohu,,loui',
  cookie: {
    maxAge: 1500 * 60 * 1000
  },
  saveUninitialized: false,
  resave: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

if (app.get('env') !== 'development') {
  app.get('*',function(req,res,next){
    if(req.headers['x-forwarded-proto']!='https')
      res.redirect('https://' + req.hostname + req.url);
    else
      next() /* Continue to other routes if we're not redirecting */
  })
}

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images/favicon', 'favicon.ico')));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(helmet());


app.use('/', a_routes);
app.use('/', o_routes);
app.use('/', g_auth);
app.use('/', o_profile);
app.use('/', o_edit);
app.use('/', o_addevent);
app.use('/', o_addlongterm);
app.use('/', v_routes);
app.use('/', g_profile);
app.use('/', v_student);
app.use('/', g_editprofile);
app.use('/', g_nav);
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
    console.error('ERROR MID : \n' + err + '\n ' + err.type + ' @ ' + req.method + req.originalUrl + '\n');
    console.error('ERROR MID stack : \n' + err.stack + '\n');
    var session = {};
    var group = {};
    var volunteer = {};
    var organism = {};
    var admin = {};
    if (req.session) {
      session = req.session;
      if (req.session.group) {
        group = req.session.group;
        if (req.session.volunteer) {
          volunteer = req.session.volunteer;
          console.error('ERROR happened to : ' + req.session.volunteer.email + ' and message displayed : ' + err.print);
        } else if (req.session.admin) {
          admin = req.session.admin;
          console.error('ERROR happened to : ' + req.session.admin.email + ' and message displayed : ' + err.print);
          if (req.session.organism) {
            organism = req.session.organism;
          }
        } else if (req.session.organism) {
          organism = req.session.organism;
          console.error('ERROR happened to : ' + req.session.organism.email + ' and message displayed : ' + err.print);
        }
      }
    }
    if (err.type == 'CRASH') { // CRASH OR MINOR
      res.status(err.status || 500);
      res.render('g_error', {
        message: err.print,
        error: err,
        group,
        organism,
        volunteer,
        admin,
        session
      });
    } else {
      res.status(err.status || 500);
      res.render('g_error', {
        message: err.print,
        group,
        organism,
        volunteer,
        admin,
        session
      });
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.error('ERROR MID : \n' + err + '\n ' + err.type + ' @  ' + req.method + '  ' + req.originalUrl + '\n');
  console.error('ERROR MID stack : \n' + err.stack + '\n');
  var session = {};
  var group = {};
  var volunteer = {};
  var organism = {};
  var admin = {};
  if (req.session) {
    session = req.session;
    if (req.session.group) {
      group = req.session.group;
      if (req.session.volunteer) {
        volunteer = req.session.volunteer;
        console.error('ERROR happened to : ' + req.session.volunteer.email + ' and message displayed : ' + err.print);
      } else if (req.session.admin) {
        admin = req.session.admin;
        console.error('ERROR happened to : ' + req.session.admin.email + ' and message displayed : ' + err.print);
        if (req.session.organism) {
          organism = req.session.organism;
        }
      } else if (req.session.organism) {
        organism = req.session.organism;
        console.error('ERROR happened to : ' + req.session.organism.email + ' and message displayed : ' + err.print);
      }
    }
  }
  if (err.type == 'CRASH') { // CRASH OR MINOR
    res.status(err.status || 500);
    res.render('g_error', {
      message: err.print,
      error: err,
      group,
      organism,
      volunteer,
      admin,
      session
    });
  } else if (err.type == 'MINOR') {} else {
    res.status(err.status || 500);
    res.render('g_error', {
      message: err.print,
      group,
      organism,
      volunteer,
      admin,
      session
    });
  }
});

module.exports = app;
