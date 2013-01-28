var Downstairs = require('../lib/downstairs.js')
  , should = require('should')
  , sql = require('sql')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , env = require('./../config/env')
  , Connection = Downstairs.Connection
  , Collection = require('../lib/downstairs.js').Collection
  , SQLAdapter = require('./../lib/adapters/sql')    
  , Validator = require('validator').Validator;

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
  , passwordPresent: function(cb){
      var validator =  new Validator();
      try{
        validator.check(this.password).notNull();
        cb(null, null);
      }
      catch(e){
        cb(null, "Password: " + e.message);
      }
    }
};


describe('validations', function(done){
  var User;

  beforeEach(function(done){
    helper.configure(new Connection.PostgreSQL(env.connectionString), new SQLAdapter(), null, done);
  });

  beforeEach(function(done){
    helper.resetDb(helper.userSQL, done);
  });

  beforeEach(function(){
    User = Collection.model('User', helper.userConfig, userValidations);
  })

  afterEach(function(){
    Downstairs.clear();
  });

  it('has a validations object', function(){
    var user = new User({username: 'fred'});
    should.exist(user.validations);
  });

  it('runs each validation', function(done){
    var user = new User();
    user.isValid(function(errs, result){
      should.exist(result);
      result.should.not.be.ok;
      errs.length.should.eql(2);
      done();
    });    
  });

  it('can use the database with table finders', function(done){
    var userValidation = {
      uniqueUsername: function(cb){
        User.find({username: user.username}, function(errs, user){
          if (user){
            cb(null, "User already exists with username, id: ", user.id);
          } else {
            cb(null, null);
          }
        });
     }
    }

    var User = Collection.model('User', helper.userConfig, userValidation);
    var user = new User({username: 'fred'});

    user.isValid(function(errs, result){
      result.should.be.ok;
      done();
    });    
  });
});


