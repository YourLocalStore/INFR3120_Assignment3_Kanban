var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { title: 'Kanban Board Creator' });
});

/* GET home page. */
router.get('/about', function(req, res, next) {
  res.render('pages/about', { title: 'About' });
});

/* GET home page. */
router.get('/contactus', function(req, res, next) {
  res.render('pages/contact', { title: 'Contact Us' });
});

module.exports = router;
