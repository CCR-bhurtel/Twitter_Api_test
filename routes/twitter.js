const router = require('express').Router();

const twitterController = require('../controllers/twitterController');
const { twitteroauth } = require('../services/twitteroauth');

router.post('/uploadMedia', twitterController.uploadMedia);

router.post('/tweet', twitterController.tweet);

router.post('/clearInterval', twitterController.clearTweetInterval);
router.delete('/deleteTweet', twitterController.deleteTweet);

router.get('/hashtags', twitterController.getTopHashTags);

router.get('/callback', twitterController.oauth);

router.get('/oauth', twitterController.oauthinit);

router.get('/sucess', (req, res) => {});

router.get('/countries', twitterController.getCountries);

module.exports = router;
