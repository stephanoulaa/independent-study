var express = require('express');
var router = express.Router();
var User = require('../models/user');


// GET route for reading data
router.get('/', function (req, res, next) {
  return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send(
              '<!DOCTYPE html>'
              +'<html lang="en" ng-app="VideoTweetStream">'
              +'<head>'
              +'<title>Profile</title>'
              +'<link href="css/profile.css" rel="stylesheet" type="text/css" media="all" />'
              +'</head>'
              +'<body>'
              +'<section>'
              +'<div class="login-info">'
              +'<h3>Name: </h3>' + '<p>' + user.username + '</p>'
              +'<h3>E-Mail: </h3>' + '<p>' + user.email + '</p>'
              +'</div>'
              +'<br/>'
              +'<!--twitter-->'
              +'<!--source: https://support.twitter.com/articles/20170071-->'
              +'<div class="twitter-div">'
              +'<div class="twitter">'
              +'<a class="twitter-timeline" data-width="300" data-height="600" data-theme="dark" data-link-color="#F5F8FA" href="https://twitter.com/coindesk">Tweets by coindesk</a> '
              +'<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
              +'</div>'
              +'</div>'
              +'<div class="NEW-section">'
              +'<p>Hello</p>'
              +'</div>'
              +'</section>'
              +'<br/>'
              +'<br/>'
              +'<footer>'
              +'<a type="button" href="/logout" id="logout">logout</a>'
              +'</footer>'
              +'<br/>'
              +'</body>'
              +'</html>'
          )
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;