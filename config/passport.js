const localStrategy = require('../strategies/local');
const jwtStrategy = require('../strategies/jwt');
const { User } = require('../models');

module.exports = function (passport) {
    passport.use(localStrategy);
    passport.use(jwtStrategy);
    // passport.use(/* Любая другая стратегия */);

    passport.serializeUser((user, done) => {
        done(null, user.id)
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findByPk(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};