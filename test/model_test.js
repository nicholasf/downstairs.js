var downstairs = require('../lib/downstairs.js')
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , helper = require('./helper')
  , ectypes = helper.ectypes;

describe('Model, table level behaviours', function(){

  var userSQL = sql.Table.define({
      name: 'user'
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

  beforeEach(function(done){
    helper.resetDb(userTableSQL, done);
  })

  it('find function can return a model instance via a primary key', function(done){
    var user
      , User = Table.register(userSQL);

    ectypes.User.create( function(err, result){
      console.log("we created our test user (we think!) ", arguments)
      user = result;

      User.findAll(function(err, users){
        should.exist(users);
        // users.length.should.equal(1);
      })
      done();
    });

  })
})