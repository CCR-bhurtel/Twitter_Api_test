const TwitterModel = require('../models/twitterModel');

const Twit = require('twit');
const twitter = require('./twitter');
const { default: Twitter } = require('twitter-lite');

async function tweetMe(newDoc) {
  const params = newDoc.tweet.params;
  const paramsGeneric = newDoc.tweet.paramsGeneric;
  let T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: newDoc.tweet.token,
    access_token_secret: newDoc.tweet.secret,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    strictSSL: true, // optional - requires SSL certificates to be valid.
  });

  if (newDoc.tweet.isAutomatic) {
    let response = await twitter.getTrendings(
      newDoc.tweet.token,
      newDoc.tweet.secret,
      newDoc.tweet.woeid
    );
    response = response.hashtags.slice(0, 8);
    response = response.map((item) => item.split(' ').join(''));
    let hashTags = response.join(' ');

    paramsGeneric.status =
      params.status + ' ' + hashTags + ' ' + Math.floor(Math.random() * 100);
  } else {
    paramsGeneric.status =
      params.status + ' ' + Math.floor(Math.random() * 100);
  }

  T.post('statuses/update', paramsGeneric, function (err, data, response) {
    if (err) {
      console.log(err);
    } else {
    }
  });
  console.log(newDoc.tweet);
  console.log('The document is tweeted');

  // await TwitterModel.findByIdAndUpdate(newDoc._id, {
  //   is_Tweeted: true,
  // });

  await TwitterModel.findByIdAndUpdate(
    { _id: newDoc._doc._id },
    {
      is_Tweeted: true,
    },
    () => {}
  );
}

var intervalCenter = {};
var lastTweetCenter = {};

exports.schedule = async function schedule(req, doc, new_tweet = true) {
  try {
    const getDocs = async () => {
      const allTweets = TwitterModel.find({
        created_by: req.session.user._id,
      }).then();
      return allTweets;
    };

    const getIncompleted_tweets = async () => {
      const Incompleted_tweets = TwitterModel.find({
        created_by: req.session.user._id,
        is_Tweeted: false,
      });
      return Incompleted_tweets;
    };

    const user = req.session.user._id;
    let newDoc = { ...doc, tweet: JSON.parse(doc.tweet) };

    clearTimeout(intervalCenter[`${user}interval1`]);

    clearTimeout(intervalCenter[`${user}interval2`]);

    let docs = await getDocs();

    if (!new_tweet || (new_tweet && docs.length === 1)) {
      tweetMe(newDoc);
      newDoc.is_Tweeted = true;
    }
    // Updating docs data

    docs = await getDocs();

    let incompleted_tweets = await getIncompleted_tweets();
    console.log(incompleted_tweets.length);
    if (incompleted_tweets.length === 0) {
      console.log('Updating all');
      clearTimeout(intervalCenter[`${user}interval2`]);
      docs.forEach(async (document) => {
        await TwitterModel.findByIdAndUpdate(document._id, {
          is_Tweeted: false,
        });
      });
      lastTweetCenter[`wasLastTweet${user}`] = true;

      intervalCenter[`${user}interval1`] = setTimeout(
        async () => {
          docs = await getDocs();
          lastTweetCenter[`wasLastTweet${user}`] = false;
          schedule(req, docs[0], false);
        },

        parseInt(newDoc.tweet.interval) * 60000
      );
    }
    if (
      new_tweet &
      lastTweetCenter[`wasLastTweet${user}`] &
      (docs.length > 1)
    ) {
      console.log('Here it comes');
      const doc = await TwitterModel.findOne({ _id: newDoc._doc._id });
      if (!doc.is_Tweeted) {
        clearTimeout(intervalCenter[`${user}interval1`]);
        clearTimeout(intervalCenter[`${user}interval2`]);

        docs.forEach(async (document, index) => {
          if (index < docs.length - 1) {
            await TwitterModel.findByIdAndUpdate(document._id, {
              is_Tweeted: true,
            });
          }
        });

        let lastTweet = JSON.parse(docs[docs.length - 2].tweet);
        let time = parseInt(lastTweet.interval);

        lastTweetCenter[`wasLastTweet${user}`] = false;
        intervalCenter[`${user}interval2`] = setTimeout(() => {
          schedule(req, doc, false);
        }, time * 60000);
      }
    } else if (docs.length > 1) {
      console.log('But it comes here');
      // wasLastTweet = false;
      docs = await getDocs();
      incompleted_tweets = await getIncompleted_tweets();
      if (docs.length !== incompleted_tweets.length) {
        lastTweetCenter[`wasLastTweet${user}`] = false;
      }

      clearTimeout(intervalCenter[`${user}interval2`]);
      clearTimeout(intervalCenter[`${user}interval1`]);

      intervalCenter[`${user}interval2`] = setTimeout(async () => {
        docs = await getDocs();
        incompleted_tweets = await getIncompleted_tweets();

        const tweet = docs[docs.length - incompleted_tweets.length];
        schedule(req, tweet, false);
      }, parseInt(newDoc.tweet.interval) * 60000);
    }
  } catch {
    (err) => {
      console.log(error);
    };
  }
};
