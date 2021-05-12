const mongoose = require('mongoose');

const twitterSchema = new mongoose.Schema({
  created_by: {
    type: String,
  },
  tweet: {
    type: String,
  },
  is_Tweeted: {
    type: Boolean,
    required: [true, 'You know it'],
  },
});

const TwitterModel = mongoose.model('Tweet', twitterSchema);
module.exports = TwitterModel;
