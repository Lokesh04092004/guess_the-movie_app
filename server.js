const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// ---- Serve static frontend files ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Session setup ----
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// ---- Passport Google OAuth Strategy ----
passport.use(new GoogleStrategy({
    clientID: "93007020043-4ld3tal6epvt9gdon3mkllv9osektbou.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login.html');
}

// ---- Routes ----
app.get('/', ensureAuthenticated, (req, res) => {
  res.redirect('/index.html');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/index.html');
  }
);

app.get('/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({
    name: req.user.displayName,
    email: req.user.emails[0].value,
    picture: req.user.photos[0].value
  });
});

// New endpoint to save game results
app.post('/save-result', ensureAuthenticated, (req, res) => {
  const { timeTaken } = req.body;
  const userName = req.user.displayName;
  const date = new Date().toLocaleString();
  
  // Log the data to console (terminal)
  console.log('Game Result:', {
    userName,
    timeTaken,
    date
  });
  
  res.json({ success: true, message: 'Result saved successfully' });
});

// Route to check if user is logged in
app.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Route to logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login.html');
  });
});

// ---- Start server ----
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});