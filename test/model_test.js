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
    Downstairs.go(env.connectionString);
    helper.resetDb(userTableSQL, done);
  })

  beforeEach(function(done){
    ectypes.User.create( function(err, result){
      user = result;
      done();
    });
  })

  it('returns an array of instantiated model instances', function(done) {
    User.findAll(function(err, users){
      should.exist(users);
      users.length.should.equal(1);
      users[0].properties.email.should.be.a('string');
      done();
    })
  })
});

  /*
  it('find function can return a model instance via a primary key', function(done){

    User.findAll(function(err, users){
      should.exist(users);
      // users.length.should.equal(1);
      done();
    })
  })
*/