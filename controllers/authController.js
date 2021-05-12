const authService = require('../services/authService')
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { encode } = require('punycode');
const user = require('../models/user');
const { response } = require('express');

exports.signUp = function (req, res, next) {
  const user = authService.registerUser(req.body.email, req.body.password, req.body.username);
  var html = fs.readFileSync(path.join(process.cwd() + '/views/auth.html'), 'utf8');
  var $ = cheerio.load(html);
  var scriptNode = "<script>document.getElementById('notification').style.display = 'block' </script>";
  $('body').append(scriptNode);
  res.send($.html());
}


exports.login = async function (req, res, next) {
  try {
    const user = await authService.loginUser(req.body.email, req.body.password);
    if (user) {
      if (user.role == 'admin') {
        req.session.admin = 'admin';
        res.redirect('/admin');
      } else if (user.isActive) {
        req.session.user = user;
        res.redirect('/');
      } else {
        res.redirect('/auth?e=' + encodeURIComponent('Account not activated'));
      }
    }
    else {
      res.redirect('/auth?e=' + encodeURIComponent('Incorrect username or password'));

    }
  } catch (err) {
    res.redirect('/auth');
  }
}

exports.resetPassword = async function (req, res, next) {
  try {
    await authService.resetPassword(req.body.email, req.body.token, req.body.password);
    res.redirect('/auth?e=' + encodeURIComponent('Password Reset Success'))
  } catch (err) {
    console.log(errr);
    res.redirect('/resetpassword?e=' + encodeURIComponent('Token Mismatch'))
  }

}

exports.sendtoken = async function (req, res, next) {
  try {
    const response = await authService.sendResetToken(req.body.email);
    res.redirect('/resetpassword?e=' + encodeURIComponent(`${response.message}`))
  } catch (err) {
    res.redirect('/resetpassword?e=' + encodeURIComponent('User doesnot exist'))
  }
}

exports.logout = function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      next(err);
    } else {
      res.redirect('/');
    }
  });

}

exports.activate = async function (req, res, next) {
  const params = { 'email': req.query.email, 'activationToken': req.query.activationToken };
  try {
    const response = await authService.activateAccount(params);
    if (response.status === 201) {
      res.redirect('/auth?e=' + encodeURIComponent('Account Activated Please Login'))
    } else {
      res.redirect('/auth?e=' + encodeURIComponent('Not allowed'))
    }

  } catch (err) {
    res.redirect('/auth?e=' + encodeURIComponent('Not allowed'))
  }

}

exports.getUsers = async function (req, res, next) {
  // if (req.session.role === 'admin') {
  const users = await authService.getAllUsers();
  res.json(users);
  // }
}

exports.blockUser = async function (req, res, next) {
  const response = await authService.blockAccount(req.body.email)
  if (response.status === 201) {
    res.json({ "message": "Account Blocked" })
  }
}
exports.reactivateUser = async function (req, res, next) {
  console.log(req.body.email);
  const response = await authService.reactivateAccount(req.body.email)
  if (response.status === 201) {
    res.json({ "message": "Account UnBlocked" })
  }
}