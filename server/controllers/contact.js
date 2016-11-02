var express = require('express'),
     router = express.Router(),
     Contact = require('../models/contact');

router.get('/', function(req, res) {
  /*Contact.monthActvity(0, function(error, data) {
    if (!error) {
      res.status(200).json(data);
    } else {
      res.status(404).send('Not found');
    }
  });*/
});

router.get('/user', function(req, res) {
  Contact.lastLocation(function(error, data) {
    if (!error) {
      res.status(200).json(data);
    }
  });
});

router.post('/sendmail', function(req, res) {
  var mailOptions = {
    from: req.body.email,
    to: 'linch0520@gmail.com',
    cc: req.body.email,
    subject: "[Mozzan.com]" + req.body.subject,
    text: req.body.body
  };
  Contact.sendMail(mailOptions, function(error, info) {
    if(!error) {
      res.status(200).json();
      console.log('Message sent: ' + info.response);
    } else {
      res.status(400).json();
    }
  });
});

module.exports = router;
