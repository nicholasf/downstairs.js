var Downstairs = require('../lib/downstairs')
  , Collection = Downstairs.Collection
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , Connection = Downstairs.Connection
  , helper = require('./helper')
  , Validator = require('validator').Validator
  , SQLAdapter = require('./../lib/adapters/sql')  
  , async = require('async');

var pgConnection = new Connection.PostgreSQL(env.connectionString);
var sqlAdapter = new SQLAdapter();
Downstairs.add(pgConnection, sqlAdapter);

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

describe('defining callbacks on the Model that are run on the Record', function(done){
  beforeEach(function(done) {
    helper.resetDb(helper.userSQL + helper.roleSQL, done);
  });

  it("after find", function(done) {
    var User = Collection.model('User', helper.userConfig);
    var Role = Collection.model('Role', helper.roleConfig);
    User.belongsTo(Role)

    var loadRole = function(user, cb){
      user.get('role', cb);
    };

    User.when('securityDisplay', loadRole);

    Role.create({name: 'admin'}, function(err, role){
      User.create({role_id: role.id, username: 'donald'}, function(err, user) {
        User.find({id: user.id, callbacks: ['securityDisplay']}, function(err, user){
          user.role.id.should.equal(role.id);
          done()
        })
      });
    });
  });

  it("after findAll", function(done) {
    var User = Collection.model('User', helper.userConfig);
    var Role = Collection.model('Role', helper.roleConfig);
    Role.hasMany(User);
    User.belongsTo(Role);

    var loadRole = function(users, cb){
      async.forEach(users
        , function(user, cb2){user.get('role', cb2)}
        , cb)
    };

    User.when('securityDisplay', loadRole);

    Role.create({name: 'admin'}, function(err, role){
      User.create({role_id: role.id, username: 'donald'}, function(err, user) {
        User.create({role_id: role.id, username: 'mary'}, function(err, user) {
          User.findAll({callbacks: ['securityDisplay']}, function(err, users){
            users[0].role.name.should.equal('admin');
            users[1].role.name.should.equal('admin');
            done();
          });
        });
      });
    });
  });

  it('with arguments', function(done){
    var User = Collection.model('User', helper.userConfig);
    var Role = Collection.model('Role', helper.roleConfig);
    Role.hasMany(User);
    User.belongsTo(Role);

    var loadUsers = function(users, roleName, cb){

      var f = function(){
        if (roleName === 'test'){
          this.secretData = {level: 'yellow access'};
        } else if (roleName === 'admin'){
          this.secretData = {level: 'you see everything as an admin!'};        
        }
      }

      async.forEach(users
        , function(user, cb2){ 
            f.apply(user);
            cb2();
          }
        , cb)
    };

    User.when('securityDisplay', loadUsers);

    User.create({username: 'donald'}, function(err, user) {
      User.findAll({callbacks: [{name: 'securityDisplay', args: ['test']}]}, function(err, users){
        users[0].secretData.level.should.equal('yellow access');
        User.findAll({callbacks: [{name: 'securityDisplay', args: ['admin']}]}, function(err, users){
          users[0].secretData.level.should.equal('you see everything as an admin!');
          done();
        });
      });
    });
  });

  it('with arguments to use with associations', function(done){
    var User = Collection.model('User', helper.userConfig);
    var Role = Collection.model('Role', helper.roleConfig);

    Role.hasMany(User);
    User.belongsTo(Role);

    var loadUsers = function(role, cb){
      role.get('users', cb);
    }

    Role.when('loadUsers', loadUsers);

    Role.create({name: 'admin'}, function(err, role){
      Role.create({name: 'empty'}, function(err, emptyRole){
        User.create({role_id: role.id, username: 'donald'}, function(err, user) {
          Role.find({name: 'empty', callbacks: ['loadUsers']}, function(err, role){
            role.users.length.should.equal(0);
            Role.find({name: 'admin', callbacks: ['loadUsers']}, function(err, role){
              role.users.length.should.equal(1);
              done();
            });
          });
        });
      });
    });
  });
});

describe('defining events on the Model that are run on a Record', function(done){
  beforeEach(function(done) {
    helper.resetDb(helper.userSQL + helper.accountSQL, done);
  });

  it("an event for asynchronously creating a dependent", function(done) {
    var User = Collection.model('User', helper.userConfig);
    var Account = Collection.model('Account', helper.accountConfig);

    var createAccount = function(user){
      Account.create({user_id: user.id}, function(err, account){
        account.user_id.should.equal(user.id);
        done();
      });  
    }; 

    User.on('accountCreation', createAccount);

    User.create({username: 'donald'}, function(err, user) {
      User.find({username: 'donald', emit: ['accountCreation']}, function(err, user){
      })
    });
  });
});
