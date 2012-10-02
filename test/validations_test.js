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
    validator.check(this.username).notNull();
    var errs = validator.getErrors();
    if (errs){
      cb(errs, false);
    } else {
      cb(null, true);
    }
  }
  , uniqueUsername: function(cb){
    this.prototype.find({username: this.username}, function(dbErrs, user){
      if (user){
        errs.push("Username " + user.username + " already taken.");
        cb(errs, user);
      } else {
        cb(null, user);
      }
    });
  }
  , passwordPresent: function(cb){
      var validator =  new Validator();

      try{
        validator.check(null).notNull();
      }
      catch(e){
        cb(e.message, false);
      }

      cb(null, true);
    }
};


var User = Table.register(userSQL, userValidations);
describe('validations', function(done){

  it('has a validations object', function(){
    var user = new User({username: 'fred'});
    should.exist(user.validations);
  });

  it('runs each validation', function(done){
    var user = new User();
    user.validate(function(errs, result){
      should.exist(errs);
      console.log(errs, errs === 'Invalid characters');
      errs.should.equal('Invalid characters');
    });    
  })
});


