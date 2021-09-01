/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const passportLocal = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../../env/config');
// commented out for now
// const bodyParser = require('body-parser')

const User = require('../database/user');
const passportSetup = require('./passportConfig');

const database = require('../database/index');

// create server
const app = express();

// middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'https://localhost:3000',
  credentials: true,
}));
// app.use(cookieParser('secretCode'));
// TODO: fix this, session is not defined and breaks the server trying to run the code
app.use(session({
  secret: 'secretcode',
  resave: true,
  saveUninitialized: true,
}));
app.use(cookieParser('secretcode'));
app.use(passport.initialize());
app.use(passport.session());
// TODO: this passport file is broken, prevents server from running
// passport.use(new GoogleStrategy());
require('./passportConfig')(passport);

// path to database
// eslint-disable-next-line import/no-unresolved
const db = require('../database/index.js');

// connect to database
const m = new mongoose.Mongoose();
m.connect(keys.mongodb.dbURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

// routes
// Routes to handle interactions with the Front-end
/**
 * Routes Needed:
 *   1) GET Buskers
 *   2) GET Buskers - delinineated by category
 *   3) GET Performers by followers <-- NEED TO ADD
 * Performer View
 *   4) GET thier own performances
 *   5) POST new performance
 *   6) PUT - edit performance (params will include properties included within the events doc)
 *   7) DELETE a performance OR all performances
 *   8) GET number of followers
 * Mixed
 *   9) GET profile - Busker
 *  10) GET profile - audience member
 *  11) DELETE profile
 */

// 1)
app.get('/buskers', async (req, res) => {
  await database.findBuskers()
    .then((results) => {
      res.send(results);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 2)
app.get('/buskers/:category', async ({ params }, res) => {
  const { category } = params;
  await database.findBuskerByCategory(category)
    .then((results) => {
      res.status(201).send(results);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 3) Need to ADD Below
// --------------Audience View--------------------------------------

// --------------Performer View--------------------------------------

// 4)
app.get('/buskers/:name/events', async ({ params }, res) => {
  const { name } = params;
  await database.findBuskerByName(name)
    .then((results) => {
      res.send(results[0].Events);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 5)
app.post('/buskers/:name/events', async ({ params, body }, res) => {
  const { name } = params;
  const newEvent = {
    location: body.location,
    coordinates: body.coordinates,
    date: body.date,
  };
  await database.addEventFor(name, newEvent)
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 6)
app.put('/buskers/:name/events', async ({ params, body }, res) => {
  const { name } = params;
  await database.updateEventFor(name, body)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// 7)
app.delete('/buskers/:name/events', async ({ params, body }, res) => {
  const { name } = params;
  await database.deleteEventFor(name, body)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// 8)
app.get('/buskers/:name/followers', async ({ params }, res) => {
  const { name } = params;
  await database.findBuskerByName(name)
    .then((results) => {
      // NOTE: This result Object must be reconfigured to Handle followers properly.
      res.send(results);
    })
    .catch((err) => {
      res.send(err);
    });
});

// --------------Mixed--------------------------------------
// 9)
app.get('/profile/:name/busker', async ({ params }, res) => {
  const { name } = params;
  await database.findBuskerByName(name)
    .then((results) => {
      // NOTE: This result Object must be reconfigured to Handle profile properly.
      res.send(results);
    })
    .catch((err) => {
      res.send(err);
    });
  res.send('TEST');
});

// 10)
app.get('profile/:name/audience', async ({ params }, res) => {
  const { name } = params;
  await database.findBuskerByName(name)
    .then((results) => {
      // NOTE: This result Object must be reconfigured to Handle profile properly.
      res.send(results);
    })
    .catch((err) => {
      res.send(err);
    });
});

// 11)
app.delete('/profile/:name', async ({ params }, res) => {
  const { name } = params;
  await database.deleteProfileFor(name)
    .then(() => {
      res.send(202);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// --------------RANDOM TO BE DELETED--------------------------------------
app.get('/people', (req, res) => {
  database.models.people.find()
    .exec()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log('you have an err', err);
      res.end();
    });
});
app.post('/people', (req, res) => {
  res.sendStatus(201);
});

// Routes to handle logging in & logging out
app.post('/login', (req, res) => {
  // eslint-disable-next-line no-unused-vars
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err;
    if (!user) res.send('No User Exists');
    else {
      // eslint-disable-next-line no-shadow
      req.login(user, (err) => {
        if (err) throw err;
        res.send('Successfully Authenticated');
        // eslint-disable-next-line no-console
        console.log(req.user);
      });
    }
  });
  // eslint-disable-next-line no-unused-expressions
  (req, res);
});

app.post('/signup', (req, res) => {
  database.models.NewUser.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send('User Already Exists');
    if (!doc) {
      const newUser = new database.models.NewUser({
        username: req.body.username,
        password: req.body.password,
      });
      await newUser.save();
      res.send('User Created');
    }
  });
});

app.get('/user', (req, res) => {
  // store entire user
  res.send(req.user);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/people', (req, res) => {
  database.models.people.find()
    .exec()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log('you have an err', err);
      res.end();
    });
});
app.post('/people', (req, res) => {
  res.sendStatus(201);
});

const PORT = 3000;

// starting the server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on Port:${PORT}`);
});
