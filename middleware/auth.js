const passport = require('passport');

const requireAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = user;
        next();
    })(req, res, next);
}

const optionalAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return next();
        }

        req.user = user;
        next();
    })(req, res, next);
}

module.exports = {
    requireAuth,
    optionalAuth,
};