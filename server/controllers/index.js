var express = require('express'),
    router = express.Router();

router.use('/stream', require('./stream'));

if (process.env.TWITTER_INTEGRATION_DISABLED != 'true') {
  router.use('/twitter', require('./twitter'));
}

if (process.env.INSTAGRAM_INTEGRATION_DISABLED != 'true') {
  router.use('/instagram', require('./instagram'));
}

if (process.env.FOURSQUARE_INTEGRATION_DISABLED != 'true') {
  router.use('/foursquare', require('./foursquare'));
}

if (process.env.DRIBBBLE_INTEGRATION_DISABLED != 'true') {
  router.use('/dribbble', require('./dribbble'));
}

if (process.env.TUMBLR_INTEGRATION_DISABLED != 'true') {
  router.use('/tumblr', require('./tumblr'));
  router.get('/post/:postId', function(req, res) {
    res.redirect('/#/post/' + req.params.postId);
  });
}

if (process.env.GITHUB_INTEGRATION_DISABLED != 'true') {
  router.use('/github', require('./github'));
}

if (process.env.LASTFM_INTEGRATION_DISABLED != 'true') {
  router.use('/lastfm', require('./lastfm'));
}

if (process.env.YOUTUBE_INTEGRATION_DISABLED != 'true') {
  router.use('/youtube', require('./youtube'));
}

router.use('/contact', require('./contact'));
router.use('/blog', require('./blog'));

module.exports = router;
