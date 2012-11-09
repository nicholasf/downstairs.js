var Downstairs = require('../lib/downstairs')
  , Collection = Downstairs.Collection
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , Connection = Downstairs.Connection
  , helper = require('./helper');

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
