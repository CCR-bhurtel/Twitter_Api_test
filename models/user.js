let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  token: String,
  isActive: Boolean,
  activationToken: String,
  role: String
})

module.exports = mongoose.model('User', userSchema)