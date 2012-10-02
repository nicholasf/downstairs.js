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
      console.log("running usernamePresent");
      var validator =  new Validator();
      try{
        validator.check(this.username).notNull();
        cb(null, null);
      }
      catch(e){
        cb(null, "Username: " + e.message);
      }
  }
  // , uniqueUsername: function(cb){
  //   this.prototype.find({username: this.username}, function(dbErrs, user){
  //     if (user){
  //       errs.push("Username " + user.username + " already taken.");
  //       cb(errs, user);
  //     } else {
  //       cb(null, user);
  //     }
  //   });
  // }
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

  // it('has a validations object', function(){
  //   var user = new User({username: 'fred'});
  //   should.exist(user.validations);
  // });

  it('runs each validation', function(done){
    var user = new User();
    user.validate(function(errs, result){
      should.exist(result);
      result.length.should.eql(2);
      done();
    });    
  })
});


