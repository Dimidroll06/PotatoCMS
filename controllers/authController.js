const { generateTokens, verifyRefreshToken } = require('../utils/tokens');
const { User } = require('../models');
const passport = require('passport');

const register = async (req, res) => {

};

const login = async (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (!user) {
            return res.status(400).json({ error: info });
        }

        req.login(user, { session: false }, async (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Server error' });
            }

            const { accessToken, refreshToken } = await generateTokens({ id: user.id });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.json({
                accessToken,
                user: {
                    id: user.id,
                    username: user.username
                }
            });
        });
    })(req, res, next);
};

const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({  error: 'No refresh token' });
    }

    try {
        const decoded = verifyRefreshToken(token);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const { accessToken } = generateTokens({ id: user.id });
        res.json({ accessToken });
    } catch (error) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }
};

const logout = async (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }

        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out' });
    })
};

module.exports = {
    login,
    refresh,
    logout
};