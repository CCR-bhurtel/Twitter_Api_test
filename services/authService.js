let User = require('../models/user');
let emailService = require('./email');

exports.registerUser = function (email, password, username,) {
  //directly interacting with the database.
  let newUser = new User({
    email,
    password,
    username,
    isActive: false
  })
  newUser.save()
    .then(async doc => {
      await module.exports.sendActivationToken(doc.email)
      return { status: 201, user: doc }
    })
    .catch(err => {
      console.error(err)
    })
}

exports.loginUser = function (email, password) {
  return new Promise((resolve, reject) => {

    User.findOne({ 'email': email, 'password': password }, function (err, user) {
      if (err) throw reject(err);
      resolve(user);
    })

  })

}

exports.resetPassword = function (email, token, password) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ 'email': email, 'token': token });
    if (user) {
      const update = { 'password': password };
      await user.updateOne(update);
      resolve({ "status": 201, "message": "password reset successfull" })
    }
    else {
      reject({ "status": 401, "message": "Invalid Token" })
    }
  })
}


exports.sendResetToken = function (email) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ 'email': email });
    if (user) {
      const update = { 'token': Math.floor(1000 + Math.random() * 9000) };
      await user.updateOne(update);
      const info = await emailService.sendMail(email, update.token, 'reset');

      resolve({ "status": 201, "message": "reset token sent into email" })
    } else {
      reject({ "status": 401, "message": "User does not exist in our system" })
    }
  })
}

exports.sendActivationToken = function (email) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ 'email': email });
    if (user) {
      const update = { 'activationToken': Math.floor(1000 + Math.random() * 9000) };
      await user.updateOne(update);
      const info = await emailService.sendMail(email, update.activationToken, 'activation');

      resolve({ "status": 201, "message": "reset token sent into email" })
    } else {
      reject({ "status": 401, "message": "User does not exist in our system" })
    }
  })
}

exports.activateAccount = function (params) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne(params);
    if (user) {
      const update = { 'isActive': true };
      await user.updateOne(update);
      resolve({ "status": 201, "message": "Account activation success" })
    } else {
      reject({ "status": 401, "message": "Either user doesnot exist or link is invalid" })
    }
  })
}

exports.blockAccount = function (email) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ 'email': email });
    if (user) {
      const update = { 'isActive': false };
      await user.updateOne(update);
      resolve({ "status": 201, "message": "Account Blocked" })
    } else {
      reject({ "status": 401, "message": "Either user doesnot exist or link is invalid" })
    }
  })
}


exports.getAllUsers = function () {
  return new Promise(async (resolve, reject) => {
    const users = await User.find({});
    resolve(users);
  })

}


exports.reactivateAccount = function (email) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ 'email': email });
    if (user) {
      const update = { 'isActive': true };
      console.log(user);
      await user.updateOne(update);
      resolve({ "status": 201, "message": "Account UnBlocked" })
    } else {
      reject({ "status": 401, "message": "Either user doesnot exist or link is invalid" })
    }
  })
}
