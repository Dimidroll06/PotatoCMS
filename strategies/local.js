const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../models/User');

const localStrategy = new LocalStrategy({}, async (username, password, done) => {
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
});

module.exports = localStrategy;