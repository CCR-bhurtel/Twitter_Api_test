require('dotenv').config();

var express = require('express');

var fileUpload = require('express-fileupload');

var cors = require('cors');

var morgan = require('morgan');

var session = require('express-session');

var bodyParser = require('body-parser');

var passport = require('passport');

var Strategy = require('passport-twitter').Strategy;

var cookieParser = require('cookie-parser');

var mongoose = require('mongoose');

var twitterController = require('./controllers/twitterController');

var twitterRoutes = require('./routes/twitter');

var indexRoutes = require('./routes/index');

var authRoutes = require('./routes/auth');

mongoose.connect(
  'mongodb+srv://aakash:random@cluster0.5x16l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useFindAndModify: false, useUnifiedTopology: true, useNewUrlParser: true }
);

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static('views'));
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new Strategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: 'http://localhost/callback',
    },
    function (token, tokenSecret, profile, cb) {
      return cb(
        null,
        token + ',' + profile.displayName + ',' + profile.photos[0].value,
        tokenSecret
      );
    }
  )
);

passport.serializeUser(function (user, done) {});

passport.deserializeUser(function (id, done) {});

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.use(express.json());
app.use('/', twitterRoutes);
app.use('/', indexRoutes);
app.use('/', authRoutes);

app.listen(process.env.PORT || 80, () => {
  console.log('server started listening at port 4040');
});
