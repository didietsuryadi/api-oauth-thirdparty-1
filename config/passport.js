`use strict`
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/user')
const hash = require('password-hash')
require('dotenv').config()


module.exports = function (passport) {

  passport.serializeUser(function(user, callback){
    callback(null, user)
  })

  passport.deserializeUser(function (id, done) {
   User.findById(id, function (err, user) {
     done(err, user)
   })
  })

//------------------------LocalStrategy----------------------------------------------
  passport.use('didit-login', new LocalStrategy(function(usernameInput, password, cb){

    User.findOne({ 'local.username': usernameInput }, function(err, data){
      if (!data) {
        cb(null, false)
      }else{
        if (hash.verify(password, data.local.password)) {
          cb(null, data)
        }else{
          cb(null, false)
        }
      }

    })

  }))
//-------------------------END-------------------------------------------------------

//------------------------Twitter STrategy----------------------------------------------
  passport.use(new TwitterStrategy({
    consumerKey: process.env.twitterConsumerKey,
    consumerSecret: process.env.twitterConsumerSecret,
    callbackURL: process.env.twitterCallbackURL
  },
  function (token, tokenSecret, profile, done) {
    process.nextTick(function () {
      User.findOne({ 'twitter.id': profile.id }, function (err, user) {
        if (err) return done(err)
        if (user) { return done(null, user) } else {
          User.create({
            'twitter.id' : profile.id,
            'twitter.token' : token,
            'twitter.username' : profile.username,
            'twitter.name' : profile.displayName
          }, function(err,data){
            if(err) throw err;
            return done(null, data)
          })
        }
      })
    })
  }
))

//------------------------Facebook Strategy----------------------------------------------
passport.use(new FacebookStrategy({
  clientID: process.env.facebookClientID,
  clientSecret: process.env.facebookClientSecret,
  callbackURL: process.env.facebookCallbackURL,
  profileFields: ['id', 'emails', 'displayName']
},
function (token, refreshToken, profile, done) {
  process.nextTick(function () {
    User.findOne({ 'facebook.id': profile.id }, function (err, user) {
      if (err) return done(err)
      if (user) { return done(null, user) } else {
        User.create({
          'facebook.id' : profile.id,
          'facebook.token' : token,
          'facebook.name' : profile.displayName,
          'facebook.email' : profile.emails[0].value
        }, function(err,data){
          if(err) throw err;
          return done(null, data)
        })
      }
    })
  })
}
))

//------------------------GoogleStrategy----------------------------------------------
passport.use(new GoogleStrategy({
  clientID: process.env.googleClientID,
  clientSecret: process.env.googleClientSecret,
  callbackURL:  process.env.googleCallbackURL
},
function (token, refreshToken, profile, done) {
  process.nextTick(function () {
    User.findOne({ 'google.id': profile.id }, function (err, user) {
      if (err) return done(err)
      if (user) { return done(null, user) } else {
        User.create({
          'google.id' : profile.id,
          'google.token' : token,
          'google.email' : profile.emails[0].value,
          'google.name' : profile.displayName
        }, function(err,data){
          if(err) throw err;
          return done(null, data)
        })
      }
    })
  })
}
))
//------------------------github Strategy----------------------------------------------
passport.use(new GitHubStrategy({
  clientID: process.env.githubClientID,
  clientSecret: process.env.githubClientSecret,
  callbackURL: process.env.githubCallbackURL
},
function(token, refreshToken, profile, done) {
  process.nextTick(function () {
  User.findOne({ githubId: profile.id }, function (err, user) {
    if (err) return done(err)
    if (user) { return done(null, user) } else {
      User.create({
        'github.id' : profile.id,
        'github.token' : token,
        'github.username' : profile.username,
        'github.name' : profile.displayName
      }, function(err,data){
        if(err) throw err;
        return done(null, data)
      })
    }
  })
})
}
))
}
