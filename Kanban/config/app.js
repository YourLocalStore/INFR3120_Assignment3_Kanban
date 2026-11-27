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
let flash = require("connect-flash")

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
