var Downstairs = require('../lib/downstairs.js').Downstairs
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , Table = require('../lib/downstairs.js').Table
  , Validator = require('validator').Validator;

var userSQL = helper.userSQL;
var userTableSQL = helper.userTableSQL;

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


var User = Table.register(userSQL, userValidations);
describe('validations', function(done){

  beforeEach(function(done){
    Downstairs.go(env.connectionString)
    helper.resetDb(userTableSQL, done);
  })

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
        this.find(this.sql.username.equals(this.username), function(errs, user){
          if (user){
            cb(null, "User already exists with username, id: ", user.id);
          } else {
            cb(null, null);
          }
        });
     }
    }

    var User = Table.register(userSQL, userValidation);
    var user = new User({username: 'fred'});

    user.isValid(function(errs, result){
      result.should.be.ok;
      done();
    });    
  });
});

