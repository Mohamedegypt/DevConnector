const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/Keys');


const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secertOrKey;


module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
       User.findById(jwt_payload.id)
           .then(user => {
            if(user){
              return done(null, user); // if ther is user it will retutrn current user
            }
            return done(null, false);// if ther isnot user it will retutrn flase or notihng
           })
           .catch(err => console.log(err))
    })
  );
};