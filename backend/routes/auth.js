const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models/schemas');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                theme: user.theme,
                dailyGoal: user.dailyGoal,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                theme: user.theme,
                dailyGoal: user.dailyGoal,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Google Auth
router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture, sub } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
            // Update googleId if not present (merging accounts if email matches)
            if (!user.googleId) {
                user.googleId = sub;
                await user.save();
            }
        } else {
            user = await User.create({
                name,
                email,
                googleId: sub,
                avatar: picture,
                password: '' // No password for Google users
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            theme: user.theme,
            dailyGoal: user.dailyGoal,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Google auth failed' });
    }
});

// get current user
router.get('/me', async (req, res) => {
    // This route should be protected in server.js but we can double check or just rely on middleware
    // Actually typically /me is protected. We will export a generic get user route.
    // For now, client handles state.
    res.status(501).json({ message: "Not implemented yet" });
});

module.exports = router;
