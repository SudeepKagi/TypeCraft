const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

module.exports = (prisma) => {
  const router = express.Router();

  // Serialize user ID to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from DB
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

  // Prioritize the Vercel/Frontend domain for callbacks to ensure cookies are first-party
  const OAUTH_CALLBACK_BASE = (FRONTEND_URL && !FRONTEND_URL.includes('localhost'))
    ? FRONTEND_URL 
    : BACKEND_URL;

  // ========== GOOGLE STRATEGY ==========
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${OAUTH_CALLBACK_BASE}/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const username = profile.displayName || email.split('@')[0];
        const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { email: email }
            ]
          }
        });

        if (user) {
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id }
            });
          }
        } else {
          user = await prisma.user.create({
            data: {
              email,
              username,
              googleId: profile.id,
              avatarUrl
            }
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }));

    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    
    router.get('/google/callback', 
      passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/auth?error=true` }),
      (req, res) => {
        res.redirect(`${FRONTEND_URL}/dashboard`);
      }
    );
  }

  // ========== GITHUB STRATEGY ==========
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${OAUTH_CALLBACK_BASE}/auth/github/callback`,
      scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
        const username = profile.username || profile.displayName;
        const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { githubId: profile.id },
              { email: email }
            ]
          }
        });

        if (user) {
          if (!user.githubId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { githubId: profile.id }
            });
          }
        } else {
          user = await prisma.user.create({
            data: {
              email,
              username,
              githubId: profile.id,
              avatarUrl
            }
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }));

    router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
    
    router.get('/github/callback', 
      passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/auth?error=true` }),
      (req, res) => {
        res.redirect(`${FRONTEND_URL}/dashboard`);
      }
    );
  }

  // ========== DEV LOGIN BYPASS ==========
  if (process.env.NODE_ENV !== 'production') {
    router.get('/dev-login', async (req, res) => {
      try {
        // Find or create dev user
        let user = await prisma.user.upsert({
          where: { email: 'dev@typecraft.local' },
          update: { onboardingCompleted: true },
          create: {
            email: 'dev@typecraft.local',
            username: 'TypeMaster_Dev',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
            onboardingCompleted: true
          }
        });

        req.login(user, (err) => {
          if (err) return res.status(500).json({ error: 'Dev Login failed' });
          res.redirect(`${FRONTEND_URL}/dashboard`);
        });
      } catch (error) {
        console.error('Dev Login Error:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  // ========== AUTH STATE ==========
  router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        authenticated: true,
        user: req.user,
        onboardingCompleted: req.user.onboardingCompleted
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  router.post('/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: 'Logout failed' });
      res.json({ success: true });
    });
  });

  return router;
};
