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
    var myDefaultPGConnection;
    myDefaultPGConnection = new Connection.PostgreSQL(env.connectionString);
    Downstairs.add(myDefaultPGConnection);
    var User = Collection.model('User', helper.userConfig);
    should.exist(User.connection);
  });
});

describe('Collection functions copied to the Model', function() {
  beforeEach(function(done) {
    helper.resetDb(helper.userSQL, done);
  });

  it('creates a new Model and returns an instance', function(done) {
    var myDefaultPGConnection;
    myDefaultPGConnection = new Connection.PostgreSQL(env.connectionString);
    Downstairs.add(myDefaultPGConnection);

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

// describe('defining events on the Model', function(done){
//   beforeEach(function(done) {
//     helper.resetDb(helper.userSQL + helper.roleSQL, done);
//   });

//   it("an event for eagerly loading the user's role", function(done) {
//     var myDefaultPGConnection;
//     myDefaultPGConnection = new Connection.PostgreSQL(env.connectionString);
//     Downstairs.add(myDefaultPGConnection);

//     var User = Collection.model('User', helper.userConfig);
//     var Role = Collection.model('Role', helper.roleConfig);

//     loadRole = (user, cb) ->
//       Role.find({id: user.id}, cb)

//     ectypes.Role.create( (err, role) ->
//       ectypes.User.create({role_id: role.id}, function(err, user) {

//       });
//     );

//   });
// })