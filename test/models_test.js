var Downstairs = require('../lib/downstairs')
  , Collection = Downstairs.Collection
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , Connection = Downstairs.Connection
  , helper = require('./helper')
  , SQLAdapter = require('./../lib/adapters/sql')
  , ectypes = helper.ectypes;  

Collection.use(Downstairs);
var pgConnection = new Connection.PostgreSQL(env.connectionString);
var sqlAdapter = new SQLAdapter();
Downstairs.add(pgConnection, sqlAdapter);

describe('A model can connect to the database', function() {
  beforeEach(function(done) {
    helper.resetDb(helper.userSQL, done);
  });

  it('has a connection', function() {
    var User = Collection.model('User', helper.userConfig);
    should.exist(User.getConnection());
  });
});

describe('Collection functions copied to the Model', function() {
  beforeEach(function(done) {
    helper.resetDb(helper.userSQL, done);
  });


  it('creates a new Model and returns an instance', function(done) {
    var User = Collection.model('User', helper.userConfig);
    console.log("******** 1")
    User.create({username: 'fred2', password: 'nottelling', email: 'test2@test.com'}, function(err, user) {
      console.log("******** 2")
      should.exist(user);
      user.should.not.be.a('boolean');
      should.exist(user.id);
      user.username.should.equal('fred2');
      done();
    });
  });
});