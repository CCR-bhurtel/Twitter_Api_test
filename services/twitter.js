// const T = require('../services/twitterclient')()
const Twit = require('twit');
const TimeoutHelper = require('../helpers/timeouthelper');
const TwitterModel = require('../models/twitterModel');
const { schedule } = require('./schedule');
/**
 * Upload Image
 * @param {String} b64content - base64 encoded image data
 * @returns {Promise}
 */

exports.uploadImage = function (b64content, accessToken, accessTokenSecret) {
  return new Promise((resolve, reject) => {
    let T = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: accessToken,
      access_token_secret: accessTokenSecret,
      timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
      strictSSL: true, // optional - requires SSL certificates to be valid.
    });
    T.post(
      'media/upload',
      { media_data: b64content },
      function (err, data, response) {
        if (!err) {
          var mediaIdStr = data.media_id_string;
          var altText =
            'Small flowers in a planter on a sunny balcony, blossoming.';
          var meta_params = {
            media_id: mediaIdStr,
            alt_text: { text: altText },
          };
          resolve(meta_params);
        }
        reject(err);
      }
    );
  });
};

/**
 * Gets Trending Hashtags
 * @returns {Promise}
 */

exports.getTrendings = function (accessToken, accessTokenSecret, woeid = '1') {
  return new Promise((resolve, reject) => {
    let T = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: accessToken,
      access_token_secret: accessTokenSecret,
      timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
      strictSSL: true, // optional - requires SSL certificates to be valid.
    });
    T.get('trends/place', { id: woeid }, function (err, data, response) {
      if (!err) {
        const hashtags = data[0].trends.map((trend) => {
          return trend.name.charAt(0) === '#'
            ? trend.name.split(' ').join('')
            : `#${trend.name.split(' ').join('')}`;
        });
        resolve({ status: 200, hashtags });
      } else {
        reject(err);
      }
    });
  });
};

/**
 * Makes a Tweet repeatedly in given interval
 *
 * @param {String} mediaId -mediaId of the image uploaded which needs to be attached with the tweet
 * @param {String} hashtags -status text with hashtags included
 * @param {Number} interval -interval in minutes to make tweet repeatedly
 * @returns {Promise}
 */

exports.tweet = async function (
  req,
  mediaId,
  hashtags,
  interval,
  token,
  secret,
  isAutomatic
) {
  console.log('New tweet');
  return new Promise(async (resolve, reject) => {
    let params = mediaId
      ? { status: hashtags, media_ids: [mediaId] }
      : { status: hashtags };
    let paramsGeneric = mediaId
      ? { status: hashtags, media_ids: [mediaId] }
      : { status: hashtags };

    const doc = await TwitterModel.create({
      created_by: req.session.user._id,
      is_Tweeted: false,
      tweet: JSON.stringify({
        params,
        paramsGeneric,
        token,
        secret,
        hashtags,
        interval,
        isAutomatic: false,
      }),
    });

    schedule(req, doc, true);

    resolve({
      message: 'tweet scheduled',
      tweetId: doc._id,
      hashtags,
      created_at: '' + Date.now(),
      interval,
    });
  });
};

/**
 * Clears the Interval and Stops Tweeting
 *
 * @param {number} tweetId
 * @returns {Promise} - promise with resolved value of tweetId which is cleared
 */

exports.clearTweet = async function (tweetId) {
  return new Promise(async (resolve, reject) => {
    await TwitterModel.findByIdAndDelete(tweetId);
    resolve({ message: 'Tweet cleared', tweetId });
  });
};

exports.getCOuntryList = function (token, secret) {
  return new Promise((resolve, reject) => {
    let T = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: token,
      access_token_secret: secret,

      timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
      strictSSL: true, // optional - requires SSL certificates to be valid.
    });
    T.get('trends/available', function (err, data, response) {
      if (!err) {
        const countries = data.map((each) => {
          return { country: each.country, place: each.name, woeid: each.woeid };
        });
        resolve({ status: 200, countries });
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
};
/**
 *
 * @param {String} mediaId mediaId of uploaded Media Object.
 * @param {String} tweetText status for Tweet.
 * @param {Number} interval interval to make a tweet on.
 * @param {String} token token of the twitter user.
 * @param {String} secret secret of the twitter user.
 * @param {String} woeid country list.
 * @returns {Promise}
 */
exports.tweetAutomatic = async function (
  req,
  mediaId,
  tweetText,
  interval,
  token,
  secret,
  woeid
) {
  return new Promise(async (resolve, reject) => {
    let params = mediaId
      ? { status: tweetText, media_ids: [mediaId] }
      : { status: tweetText };
    let paramsGeneric = mediaId
      ? { status: tweetText, media_ids: [mediaId] }
      : { status: tweetText };

    const doc = await TwitterModel.create({
      created_by: req.session.user._id,
      is_Tweeted: false,
      tweet: JSON.stringify({
        params,
        paramsGeneric,
        token,
        secret,
        tweetText,
        interval,
        woeid,
        isAutomatic: true,
      }),
    });

    schedule(req, doc, true);

    resolve({
      message: 'tweet scheduled',
      tweetId: doc._id,
      tweetText,
      created_at: '' + Date.now(),
      interval,
    });
  });
};
