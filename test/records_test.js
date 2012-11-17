var Downstairs = require('../lib/downstairs')
  , Collection = Downstairs.Collection
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , Connection = Downstairs.Connection
  , helper = require('./helper')
  , Validator = require('validator').Validator;

var pgConnection = new Downstairs.Connection.PostgreSQL(env.connectionString);
Downstairs.add(pgConnection);
Collection.use(Downstairs);

describe('save', function() {
  beforeEach(function(done){
    helper.resetDb(helper.userSQL, done);
  })

  it('saves without validations', function(done) {
    var User = Collection.model('User', helper.userConfig);
    
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    helper.ectypes.User.create(data, function(err, results) {
      User.find({username: 'fred'}, function(err, user){
        user.username = 'mary';
        user.save(function(err, user){
          user.username.should.equal('mary');
          done();
        });
      });
    });
  });

  describe('validations', function(done){
    it('before a save', function(done){
      var userValidations = {
        usernamePresent: function(cb){
          var validator =  new Validator();
          try{
            validator.check(this.username).notNull();
            cb(null, null);
          }
          catch(e){
            cb(null, "Username: " + e.message);
          }
        }
      };

      var User = Collection.model('User', helper.userConfig, userValidations);    
      var data = {username: 'fred', email: 'fred@moneytribe.com.au'};

      helper.ectypes.User.create(data, function(err, results) {
        User.find({username: 'fred'}, function(err, user){
          user.username = null;

          user.save(function(err, user){
            should.exist(err);
            should.not.exist(user);
            done();
          });
        });
      });
    });
  });
});

describe('destroy', function() {
  beforeEach(function(done){
    helper.resetDb(helper.userSQL, done);
  })

  it('successfully removes the instance', function(done) {
    var User = Collection.model('User', helper.userConfig);
    
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    helper.ectypes.User.create(data, function(err, results) {
      User.find({username: 'fred'}, function(err, user){
        user.destroy(function(err, result){
          result.should.be.ok;
          User.find({username: 'fred'}, function(err, user){
            should.not.exist(user)
            done();
          });
        });
      });
    });
  });
});


describe('defining callbacks on the Model that are run on a Record', function(done){
  beforeEach(function(done) {
    helper.resetDb(helper.userSQL + helper.roleSQL, done);
  });

  it("a callback for eagerly loading the user's role", function(done) {
    var myDefaultPGConnection;
    myDefaultPGConnection = new Connection.PostgreSQL(env.connectionString);
    Downstairs.add(myDefaultPGConnection);

    var User = Collection.model('User', helper.userConfig);
    var Role = Collection.model('Role', helper.roleConfig);
    User.belongsTo(Role)

    var loadRole = function(user, cb){
      user.get('role', cb);
    };

    User.when('securityCheck', loadRole);

    Role.create({name: 'admin'}, function(err, role){
      User.create({role_id: role.id, username: 'donald'}, function(err, user) {
        User.find({id: user.id, callbacks: ['securityCheck']}, function(err, user){
          user.role.id.should.equal(role.id);
          done()
        })
      });
    });
  });
})

describe('defining events on the Model that are run on a Record', function(done){
  beforeEach(function(done) {
    helper.resetDb(helper.userSQL + helper.accountSQL, done);
  });

  it("an event for asynchronously creating a dependent", function(done) {
    var myDefaultPGConnection;
    myDefaultPGConnection = new Connection.PostgreSQL(env.connectionString);
    Downstairs.add(myDefaultPGConnection);

    var User = Collection.model('User', helper.userConfig);
    var Account = Collection.model('Account', helper.accountConfig);

    var eventualUser = null;

    var createAccount = function(user){
      Account.create({user_id: user.id}, function(err, account){
        account.user_id.should.equal(user.id);
        done();
      });  
    }; 

    User.on('accountCreation', createAccount);
    User.create({username: 'donald'}, function(err, user) {
      User.find({username: 'donald', emit: ['accountCreation']}, function(err, user){
        console.log('dummy callback called');
      })
    });
  });
})
