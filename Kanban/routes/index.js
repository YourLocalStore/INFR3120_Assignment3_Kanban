var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Kanban Board Creator' });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('pages/about', { title: 'About' });
});

/* GET contact page. */
router.get('/contactus', function(req, res, next) {
  res.render('pages/contact', { title: 'Contact Us' });
});

/* GET sign in page. */
router.get('/signin', function(req, res, next) {
  res.render('pages/signin', { title: 'Sign In' });
});

module.exports = router;
