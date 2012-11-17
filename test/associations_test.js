var Downstairs = require('../lib/downstairs')
  , Collection = Downstairs.Collection
  , should = require('should')
  , sql = require('sql')
  , Connection = require('../lib/connections/connection')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , env = require('./../config/env');

var pgConnection = new Downstairs.Connection.PostgreSQL(env.connectionString);
Downstairs.add(pgConnection);

describe('belongsTo', function(done){

  beforeEach(function(done){
     helper.resetDb(helper.userSQL + helper.roleSQL, done);
  })

  it('configures a belongsTo', function(done){
    var User = Collection.model('User', helper.userConfig);
    var Role = Collection.model('Role', helper.roleConfig);

    User.belongsTo(Role)

    var roleData = {name: 'someRole'};
    ectypes.Role.create(roleData, function(err, results){
      Role.find({name: 'someRole'}, function(err, role){
        var userData = {
            password: '5f4dcc3b5aa765d61d8327deb882cf99'
          , username: 'fred'
          , email: 'fred@moneytribe.com.au'
          , role_id: role.id
        };

        ectypes.User.create(userData, function(err, results) {
          User.find({ username: 'fred', email: 'fred@moneytribe.com.au', role_id: role.id } , function(err, user){
            should.exist(user._role)
            user.get('role', function(err, userRole){
              userRole.id.should.equal(role.id);
              done();
            })
          });
        });
      });
    });
  });
});


describe('hasOne', function(done){
  beforeEach(function(done){
     helper.resetDb(helper.userSQL + helper.accountSQL, done);
  })

  it('configures a hasOne', function(done){
    var User = Collection.model('User', helper.userConfig);
    var Account = Collection.model('Account', helper.accountConfig);

    User.hasOne(Account);

    var userData = {
        password: '5f4dcc3b5aa765d61d8327deb882cf99'
      , username: 'fred'
      , email: 'fred@moneytribe.com.au'
    };

    ectypes.User.create(userData, function(err, results) {
      User.find({ username: 'fred', email: 'fred@moneytribe.com.au'} , function(err, user){
        should.exist(user._account);
        ectypes.Account.create({user_id: user.id}, function(err, result){
          Account.find({user_id: user.id}, function(err, account){
            user.get('account', function(err, userAccount){
              account.id.should.equal(userAccount.id);
              done();
            })
          });
        })
      });            
    });
  });
});

describe('hasMany', function(done){
  beforeEach(function(done){
     helper.resetDb(helper.userSQL + helper.roleSQL, done);
  })

  it('configures a hasMany', function(done){
    var User = Collection.model('User', helper.userConfig);
    var Role = Collection.model('Role', helper.roleConfig);

    Role.hasMany(User);

    var roleData = {name: 'someRole'};   
    ectypes.Role.create(roleData, function(err, results){
      Role.find({name: 'someRole'}, function(err, role){

        var userData = {
            password: '5f4dcc3b5aa765d61d8327deb882cf99'
          , username: 'fred'
          , email: 'fred@moneytribe.com.au'
          , role_id: role.id
        };

        ectypes.User.create(userData, function(err, results) {
          userData.username = 'mary';
          userData.email = 'mary@moneytribe.com.au';
          ectypes.User.create(userData, function(err, results) {

            User.find({ username: 'fred', email: 'fred@moneytribe.com.au', role_id: role.id } , function(err, user){
              User.find({ username: 'mary', email: 'mary@moneytribe.com.au', role_id: role.id } , function(err, user){
                role.get('users', function(err, users){
                  users.length.should.equal(2);
                  done();
                });
              });
            });
          });            
        });
      });
    });
  });
});

