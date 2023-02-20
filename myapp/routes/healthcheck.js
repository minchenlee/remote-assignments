let express = require('express');
let router = express.Router();

/* GET healthcheck. */
router.get('/', function(req, res, next) {
  res.render('healthcheck', { title: 'OK' });
});

module.exports = router;
