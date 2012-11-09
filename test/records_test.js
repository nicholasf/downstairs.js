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
