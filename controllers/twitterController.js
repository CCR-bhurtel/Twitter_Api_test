const TwitterModel = require('../models/twitterModel');
const twitterService = require('../services/twitter');
const twitteroauth = require('../services/twitteroauth');
/**
 * Upload Media File
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

exports.uploadMedia = function (req, res, next) {
  twitterService
    .uploadImage(
      req.files.file.data.toString('base64'),
      req.headers.accesstoken,
      req.headers.accesstokensecret
    )
    .then((data) => res.json(data))
    .catch((err) => next(err));
};

/**
 * Get Top Hash Tags
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

exports.getTopHashTags = function (req, res, next) {
  twitterService
    .getTrendings(
      req.headers.accesstoken,
      req.headers.accesstokensecret,
      req.headers.woeid
    )
    .then((data) => res.json(data))
    .catch((err) => next(err));
};

/**
 * Tweet on Twitter
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

exports.tweet = function (req, res, next) {
  req.body.isAutomatic
    ? twitterService
        .tweetAutomatic(
          req,
          req.body.mediaId,
          req.body.hashtags,
          req.body.interval,
          req.headers.accesstoken,
          req.headers.accesstokensecret,
          req.body.woeid
        )
        .then((data) => res.json(data))
        .catch((err) => {
          next(err);
        })
    : twitterService
        .tweet(
          req,
          req.body.mediaId,
          req.body.hashtags,
          req.body.interval,
          req.headers.accesstoken,
          req.headers.accesstokensecret
        )
        .then((data) => res.json(data))
        .catch((err) => next(err));
};

exports.clearTweetInterval = function (req, res, next) {
  twitterService
    .clearTweet(req.body.tweetId)
    .then((data) => res.json(data))
    .catch((err) => next(err));
};

exports.deleteTweet = async function (req, res, next) {
  console.log('Delete request came');
  try {
    await TwitterModel.findByIdAndDelete({ _id: req.body.tweetId });
    res.json({
      tweetId: req.body.tweetId,
    });
  } catch (err) {
    res.status(500).json({ error: "Can't delete the tweet" });
  }
};

exports.oauth = function (req, res, next) {
  twitteroauth.twitteroauth(req, res, next);
};

exports.oauthinit = function (req, res, next) {
  twitteroauth.init(req, res, next);
};

exports.getCountries = function (req, res, next) {
  twitterService
    .getCOuntryList(req.headers.accesstoken, req.headers.accesstokensecret)
    .then((data) => res.json(data))
    .catch((err) => next(err));
};
