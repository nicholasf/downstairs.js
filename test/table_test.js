var Downstairs = require('../lib/downstairs')
  , Table = Downstairs.Table
  , should = require('should')
  , sql = require('sql')
  , Connection = require('../lib/connections/connection')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , env = require('./../config/env');

var pgConnection = new Downstairs.Connection.PostgreSQL(env.connectionString);
Downstairs.add(pgConnection);

var userSQL = sql.Table.define({
  name: 'users'
  , quote: true
  , schema: 'public'
  , columns: ['id' 
    , 'username' 
    , 'created_at'
    , 'updated_at'
    , 'is_active'
    , 'email'
    , 'password'
  ]
});

var roleSQL = sql.Table.define({
  name: 'roles'
  , quote: true
  , columns: ['id' 
    , 'name' 
  ]
});


describe('Tables creating Model constructors', function(){
  it('returns a Model (a constructor function), with a mappings property', function(){
    var User = Table.model('User', userSQL);
    should.exist(User);
    User.sql.should.equal(userSQL);
  });

  it('copies Table level behaviours onto the Model', function(){
    var User = Table.model('User', userSQL);
    should.exist(User.findAll);
  });

  it('does not copy the Table.model function onto the Model', function(){
    var User = Table.model('User', userSQL);
    should.not.exist(User.register);
  });

  it('does not confuse sql objects when multiple models are declared', function(){
    var User = Table.model('User', userSQL);
    var Role = Table.model('Role', roleSQL);   
    User.sql.should.equal(userSQL);
    Role.sql.should.equal(roleSQL); 
  });
});

describe('Table level behaviours', function(done) {
  beforeEach(function(done){
     helper.resetDb(helper.userTableSQL, done);
  })

  it('finds a record with a where JSON condition', function(done) {
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.find({username: 'fred', email: 'fred@moneytribe.com.au'} , function(err, user){
        should.exist(user);
        user.username.should.equal('fred');
        done();
      });
    });
  });

  it('finds all records with an empty object JSON condition', function(done) {
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll({} , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('finds all records with a null JSON condition', function(done) {
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll(null , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('finds all records with a populated JSON condition', function(done) {
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll({username: 'fred'} , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('updates a record with JSON condition', function(done){
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.update({username: 'fredUpdated'}, {email: 'fred@moneytribe.com.au'}, function(err, result){
        should.not.exist(err);
        result.should.be.ok;
        done();
      });
    })
  })

  it('updates a record with an empty object JSON condition', function(done){
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.update({username: 'fredUpdated'}, {}, function(err, result){
        should.not.exist(err);
        result.should.be.ok;
        done();
      });
    })
  })

  it('updates a record with an empty object JSON condition', function(done){
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.update({username: 'fredUpdated'}, null, function(err, result){
        should.not.exist(err);
        result.should.be.ok;
        done();
      });
    })
  })

  it('checks for results in an update result before trying to access them', function(done){
    var User = Table.model('User', userSQL);
    User.update({}, {username: 'noMatch'}, function(err, user){
      should.exist(err);
      done();
    });
  })

  it('tolerates creation with object properties that do not map to the table', function(done){
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99'
          , username: 'fred'
          , email: 'fred@moneytribe.com.au'
          , nonsenseField: 'BOO'};

    User.create(data, function(err, user){
      should.not.exist(err);
      should.exist(user);
      user.username.should.equal('fred');
      should.not.exist(user.nonsenseField);
      done();
    });
  });

  it('tolerates update with object properties that do not map to the table', function(done){
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99'
          , username: 'fred'
          , email: 'fred@moneytribe.com.au'
          , nonsenseField: 'BOO'};

    User.create(data, function(err, user){
      User.update(data, {id: user.id}, function(err, result){
        result.should.be.ok
        done();
      })
    });
  });

  //

  it('counts records with an empty object JSON condition', function(done) {
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.count({} , function(err, count){
        should.exist(count);
        count.should.equal(1);
        done();
      });
    });
  });

  it('counts records with a null JSON condition', function(done) {
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.count(null , function(err, count){
        should.exist(count);
        count.should.equal(1);
        done();
      });
    });
  });

  it('counts records with a populated JSON condition', function(done) {
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.count({ username: 'fred'} , function(err, count){
        should.exist(count);
        count.should.equal(1);
        done();
      });
    });
  });

  it('returns zero count if it cannot find a match', function(done) {
    var User = Table.model('User', userSQL);

    User.count({ username: 'fred'} , function(err, count){
      should.exist(count);
      count.should.equal(0);
      done();
    });
  });

});
