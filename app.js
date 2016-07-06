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
var routes = require('./routes/index');
var users = require('./routes/users');
var addopp = require('./routes/addopp');
var profile = require('./routes/profile');
var auth = require('./routes/auth');
var vroutes = require('./routes/indexv');
var vprofile = require('./routes/profilev');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('./models/organism_model.js');
var User = require('./models/user_model.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//connect to mongo
//mongoose.connect('mongodb://localhost/test');
mongoose.connect('mongodb://simplyk-org:Oeuf2poule@ds021999.mlab.com:21999/heroku_ggjmn8rl?connectTimeoutMS=70000');

passport.use('local-volunteer', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.findOne({email: email}, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect mail.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      user = user.toJSON();
      user.group = "volunteer";
      return done(null, user);
    });
  }
));

passport.use('local-organism', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    Organism.findOne({email: email}, function (err, org) {
      if (err) { return done(err); }
      if (!org) {
        return done(null, false, { message: 'Incorrect mail.' });
      }
      if (!org.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      org = org.toJSON();
      org.group = "organism";
      return done(null, org, 'ok');
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(req, id, done) {
  console.log("Deserialize");
  console.log(req.session);

  if(req.session.group == "volunteer"){
    User.findById(id, function(err, user) {
      done(err, user);
    });
  }
  else if(req.session.group == "organism"){
    Organism.findById(id, function(err, org){
        done(err, org);
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

app.use('/', routes);
app.use('/', users);
app.use('/', auth);
app.use('/', profile);
app.use('/addopp', addopp);
app.use('/volunteer', vroutes);
app.use('/volunteer/profile', vprofile);

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
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
