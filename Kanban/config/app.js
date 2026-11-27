require('dotenv').config()

let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let kanbanRouter = require('../routes/kanban_routes');

let session = require("express-session")
let passport = require("passport")
let passportLocal = require("passport-local")
let mongooseFindOrCreate = require("mongoose-findorcreate")
let flash = require("connect-flash")

// https://www.passportjs.org/packages/passport-google-oauth20/
let GoogleStrategy = require('passport-google-oauth20').Strategy;
let GitHubStrategy = require('passport-github2').Strategy;

let app = express();

const mongoose = require("mongoose")
let kanbanDB = require("./db")
mongoose.connect(kanbanDB.URI)

let mongodb = mongoose.connection;
mongodb.on("error", console.error.bind(console, "Connection Error"));
mongodb.once("open", () =>{
  console.log("Connected to MongoDB")
})

app.use(session({
  secret:"SecretKey",
  saveUninitialized: false,
  resave: false
}))

let userModel = require("../models/user");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://infr3120-assignment3-kanban.onrender.com/auth/google/callback"
    // callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {

    // https://www.passportjs.org/reference/normalized-profile/
    userModel.findOrCreate({ 
      googleId: profile.id 
    }, 
    {
      username: `google_user_${profile.id}`,
      email: profile.emails[0].value,
      displayName: profile.displayName
    }, 
    function (err, user) {
      return cb(err, user);
    }); 
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://infr3120-assignment3-kanban.onrender.com/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    userModel.findOrCreate({ 
      githubId: profile.id 
    }, 
    {
      username: `github_user_${profile.id}`,
      email: profile.emails[0].value,
      displayName: profile.displayName
    }, 
    function (err, user) {
      return done(err, user);
    });
  }
));

app.use(flash());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());
passport.use(userModel.createStrategy());

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', kanbanRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
