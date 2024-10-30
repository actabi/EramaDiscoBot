// web/src/app.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const flash = require('connect-flash');
const path = require('path');
const PostgresMissionRepository = require('../../src/database/repositories/PostgresMissionRepository');

const app = express();
const repository = new PostgresMissionRepository();

// Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Discord Auth Configuration
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
    // Vous pouvez ajouter une logique de whitelist ici
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware d'authentification
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
};

// Routes
app.get('/login', passport.authenticate('discord'));
app.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/login',
    successRedirect: '/missions'
}));

app.get('/missions', isAuthenticated, async (req, res) => {
    try {
        const missions = await repository.getAllMissions();
        res.render('missions', { 
            missions,
            user: req.user,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error fetching missions:', error);
        req.flash('error', 'Erreur lors de la récupération des missions');
        res.redirect('/missions');
    }
});

app.get('/missions/new', isAuthenticated, (req, res) => {
    res.render('new-mission', { 
        user: req.user,
        messages: {
            error: req.flash('error')
        }
    });
});

app.post('/missions', isAuthenticated, async (req, res) => {
    try {
        const {
            title,
            description,
            skills,
            experienceLevel,
            duration,
            location,
            price,
            workType,
            missionType
        } = req.body;

        const mission = {
            title,
            description,
            skills: skills.split(',').map(s => s.trim()),
            experienceLevel,
            duration,
            location,
            price: parseFloat(price),
            workType,
            missionType
        };

        await repository.createMission(mission);
        req.flash('success', 'Mission créée avec succès');
        res.redirect('/missions');
    } catch (error) {
        console.error('Error creating mission:', error);
        req.flash('error', 'Erreur lors de la création de la mission');
        res.redirect('/missions/new');
    }
});

// Démarrage du serveur
const PORT = process.env.WEB_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web interface running on port ${PORT}`);
});

module.exports = app;