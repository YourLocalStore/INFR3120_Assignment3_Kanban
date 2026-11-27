let express = require('express')
let router = express.Router()

const passport = require('passport')
let DB = require('../config/db')
let User = require('../models/user')
let authFlag = false

router.get("/login", async(req, res, next) => {
  try{
    if(!req.user){
      res.render('auth/login', {
        title: "Login",
        message: req.flash("loginMessage"),
        displayName: req.user ? req.user.displayName:"",
        authFlag: authFlag
      })
    } else {
        return res.redirect("/boards")
    }
  }
  catch(err){
    console.log(err)
    res.render("auth/login", {
        title: "Error!",
        error: "Error on Server"
    })
  }
})

router.post('/login', (req, res, next) =>{
  passport.authenticate('local', (err,user,info) => {
    if(err){
      return next(err)
    } if(!user){
      authFlag = false
      req.flash('loginMessage', "Authentication Error - Try again.")
      return res.redirect("/login")
    }
    req.login(user, (err) => {
      if(err){
        return next(err)
      }
      return res.redirect('/boards')
    })
  })(req, res, next)
})

router.get("/register", async(req, res, next) =>{
  try{
    if(!req.user){
      res.render('auth/register', {
        title: "Register an Account",
        message: req.flash("registerMessage"),
        displayName: req.user ? req.user.displayName:""
      })
    } else {
        return res.redirect("/")
    }
  } catch(err) {
      console.log(err)
      res.render("auth/register", {
        title:"Error!",
        error: "Error occurred in the server."
    })
  }
})

router.post("/register", async(req, res, next) => {
  try{
    let newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      displayName: req.body.displayName
    })

    await User.register(newUser, req.body.password)
    authFlag = true
    req.flash('loginMessage', "Registration Successful!")
    return res.redirect("/login")

  } catch(err) {
    console.log("Error inserting the new user: ", err)
    if (err.name === "UserExistsError"){
      req.flash('registerMessage', 'User already exists')

    } else {
      req.flash('registerMessage', 'Registration Error')
    }
    return res.redirect('/register')
  }
})

router.get('/logout', (req, res, next) => {
  req.logout((err) =>{
    return next(err)
  }) 
  res.redirect("/")
})

// Google Authentication
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }))

router.get('/auth/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/boards');
  })

// Github Authentication
router.get('/auth/github',
  passport.authenticate('github', {

    // https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
    scope: [ 
      'user:email', 
      'read:user' ]
    })
  )

router.get('/auth/github/callback', 
  passport.authenticate('github', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/')
  })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { 
    title: 'Kanban Board Creator', 
    displayName: req.user ? req.user.displayName:""
  })
})

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('pages/about', {
    title: 'About', 
    displayName: req.user ? req.user.displayName:""
  })
})

/* GET contact page. */
router.get('/contactus', function(req, res, next) {
  res.render('pages/contact', { 
    title: 'Contact Us', 
    displayName: req.user ? req.user.displayName:""
  })
})

module.exports = router;
