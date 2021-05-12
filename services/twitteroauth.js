var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;

exports.twitteroauth = function (req, res, next) {
  passport.authenticate(
    'twitter',
    { failureRedirect: '/' },
    function (err, token, tokenSecret) {
      res.cookie('displayName', token.split(',')[1]);
      res.cookie('profilePic', token.split(',')[2]);

      res.cookie('accesstoken', token.split(',')[0]);
      // res.cookie('accesstoken',token);
      res.cookie('accesstokensecret', tokenSecret);
      res.redirect('/');
    }
  )(req, res, next);
};

exports.init = function (req, res, next) {
  console.log('Mobile device here');
  passport.authenticate('twitter')(req, res, next);
};
