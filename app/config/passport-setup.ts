const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.googleClientId,
            clientSecret: process.env.googleClientSecret,
            callbackURL: 'http://localhost:3000/api/auth/google'
        },
        // (accessToken, refreshToken, profile, done) => {
        //     // Assuming the profile object contains the user's email
        //     const user = { email: profile.emails[0].value };
)
)