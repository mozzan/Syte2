var request = require('request'),
     moment = require('moment'),
         db = require('../db'),
      dates = require('../utils/dates'),
      cache = require('memory-cache'),
      nodemailer = require('nodemailer');

exports.lastLocation = function(cb) {
  db.collection('foursquaredb').find().sort({'date': -1}).toArray(function (err, posts) {
    var location = posts[0];
    console.log('Contact location : ', location.title, ", lat: ", location.lat, ", lng: ", location.lng);
    cb(err, location);
  });
};

exports.sendMail = function(mailOptions, cb) {
  var account = process.env.GMAIL_ACCOUNT;
  var password = process.env.GMAIL_PASSWORD;
  var transporter = nodemailer.createTransport('smtps://' + account + '%40gmail.com:' + password + '@smtp.gmail.com');
  transporter.sendMail(mailOptions, function(error, info){
    if(error) {
      return console.log(error);
    }
    cb(error, info);
  });
};