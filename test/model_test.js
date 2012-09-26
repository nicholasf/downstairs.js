var Downstairs = require('../lib/downstairs.js').Downstairs
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , Table = require('../lib/downstairs.js').Table;

var userSQL = sql.Table.define({
      name: 'users'
      , quote: true
      , columns: ['id' 
        , 'username' 
        , 'created_at'
        , 'updated_at'
        , 'is_active'
        , 'email'
        , 'password'
      ]
    });

  var userTableSQL = "CREATE TABLE users\
(\
  id bigserial NOT NULL,\
  username character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  email character varying(512) unique,\
  password character varying(512),  \
  CONSTRAINT pk_users PRIMARY KEY (id)\
);"

describe('Model, table level behaviours', function(){
  var User = Table.register(userSQL)
    , user;

  beforeEach(function(done){
    Downstairs.go(env.connectionString)
    helper.resetDb(userTableSQL, done);
  })

  beforeEach(function(done){
    ectypes.User.create({email: 'someone@moneytribe.com.au'}, function(err, result){
      user = result;
      done();
    });
  })

  describe('findAll', function(done){
    it('returns an array of instantiated model instances', function(done) {
      User.findAll(function(err, users){
        should.exist(users);
        users.length.should.equal(1);
        users[0].properties.email.should.be.a('string');
        done();
      })
    })

    it('exposes properties on the model', function(done) {
      User.findAll(function(err, users){
        user = users[0];
        users[0].email.should.equal('someone@moneytribe.com.au');
        done();
      })
    })
  });

  describe('find', function(done){
    it('naively delegates to findAll', function(done) {
      User.find(function(err, user){
        user.email.should.equal('someone@moneytribe.com.au');
        done();
      })
    })

    it('handles a where clause', function(done) {
      User.find(User.sql.email.equals('someone@moneytribe.com.au'), function(err, user){
        user.email.should.equal('someone@moneytribe.com.au');
        done();
      })
    })
  });

  describe('update', function(done){
    it('changes the password of a user handling a where clause', function(done) {
      User.update({password: 'new_password'}, User.sql.email.equals('someone@moneytribe.com.au'), function(err, result){
        result.should.equal(true);
        User.find(User.sql.email.equals('someone@moneytribe.com.au'), function(err, user){
          user.password.should.equal('new_password');
          done();
        })
      })
    })

    it('changes the password of all users by not passing a where clause', function(done) {
      User.update({password: 'new_password'}, function(err, result){
        result.should.equal(true);
        User.find(User.sql.email.equals('someone@moneytribe.com.au'), function(err, user){
          user.password.should.equal('new_password');
          done();
        })
      })
    })

    it('does not change anything as no data or where clause was passed', function(done) {
      User.update(function(err, result){
        result.should.equal(false);
        done();
      })
    })

    it('does not change anything as no data was passed', function(done) {
      User.update(User.sql.email.equals('someone@moneytribe.com.au'), function(err, result){
        result.should.equal(false);
        done();
      })
    })

  });
});
