var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

router.get('/success', (req, res) => {
  res.sendFile(__dirname + '/public/success.html');
});

router.get('/error', (req, res) => {
  res.sendFile(__dirname + '/public/error.html');
});

module.exports = router;
