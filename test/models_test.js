var Downstairs = require('../lib/downstairs')
  , Collection = Downstairs.Collection
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , Connection = Downstairs.Connection
  , helper = require('./helper');

Collection.use(Downstairs);

describe('A model can connect to the database', function() {
  it('has a connection', function() {
    var pgConnection = new Connection.PostgreSQL(env.connectionString);
    Downstairs.add(pgConnection);
    var User = Collection.model('User', helper.userConfig);
    should.exist(User.connection);
  });
});

describe('Collection functions copied to the Model', function() {
  beforeEach(function(done) {
    helper.resetDb(helper.userSQL, done);
  });

  it('creates a new Model and returns an instance', function(done) {
    var pgConnection = new Connection.PostgreSQL(env.connectionString);
    Downstairs.add(pgConnection);

    var User = Collection.model('User', helper.userConfig);
    User.create({username: 'fred2', password: 'nottelling', email: 'test2@test.com'}, function(err, user) {
      should.exist(user);
      user.should.not.be.a('boolean');
      should.exist(user.id);
      user.username.should.equal('fred2');
      done();
    });
  });
});