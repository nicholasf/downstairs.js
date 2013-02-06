var Downstairs = require('../lib/downstairs')
  , Collection = Downstairs.Collection
  , should = require('should')
  , sql = require('sql')
  , Connection = require('../lib/connections/')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , env = require('./../config/env')
  , SQLAdapter = require('./../lib/adapters/sql')
  , util = require('util');

describe('Collections creating Model constructors', function(done){
  var User, Role;

  beforeEach(function(done){
    helper.configure(new Connection.PostgreSQL(env.connectionString), new SQLAdapter(), "testdb", done);
  });

  beforeEach(function(){
    User = Collection.model('User', helper.userConfig, null, "testdb");
    Role = Collection.model('Role', helper.roleConfig, null, "testdb");
  });

  afterEach(function(){
    Downstairs.clear();
  });

  it('returns a Model (a constructor function), with a mappings property', function(){
    should.exist(User);
    User.schema.should.equal(helper.userConfig);
  });

  it('copies Collection level behaviours onto the Model', function(){
    should.exist(User.findAll);
  });

  it('does not copy the Collection.model function onto the Model', function(){
    should.not.exist(User.register);
  });

  it('does not confuse sql objects when multiple models are declared', function(){
    User.schema.should.equal(helper.userConfig);
    Role.schema.should.equal(helper.roleConfig);
  });
});

describe('Collection level behaviours', function(done) {
  beforeEach(function(done){
    helper.configure(new Connection.PostgreSQL(env.connectionString), new SQLAdapter(), "testdb", done);
  });

  beforeEach(function(done){
     helper.resetDb(helper.userSQL, done);
  });

  afterEach(function(){
    Downstairs.clear();
  });

  it('finds a record with a where JSON condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {
      User.find({ username: 'fred', email: 'fred@moneytribe.com.au' } , function(err, user){
        should.exist(user);
        user.username.should.equal('fred');
        done();
      });
    });
  });

  it('finds the *right* record with a where JSON condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {
      data.username = 'mary';
      data.email = 'mary@moneytribe.com.au'
      ectypes.User.create(data, function(err, results) {
        User.find({ username: 'mary'} , function(err, user){
          should.exist(user);
          user.username.should.equal('mary');
          done();
        });
      });
    });
  });

  it('finds the *right* record with a where JSON **like** condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {
      data.username = 'mary';
      data.email = 'mary@moneytribe.com.au'
      ectypes.User.create(data, function(err, results) {
        User.findAll({ like: {username: 'ma%'} } , function(err, users){
          should.exist(users);
          users.should.have.lengthOf(1)
          users[0].username.should.equal('mary');
          done();
        });
      });
    });
  });


  it('finds a record with a where JSON condition including a null field', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au' };
    ectypes.User.create(data, function(err, results) {

      User.find({ username: 'fred', null_field: null } , function(err, user){
        should.exist(user);
        user.username.should.equal('fred');
        done();
      });
    });
  });

  it('returns nothing if finding with an undefined id', function(done){
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au' };
    ectypes.User.create(data, function(err, results) {
      var id;
      User.find({ id: id } , function(err, user){
        should.not.exist(user);
        done();
      });
    });
  });

  it('finds all records with an empty object JSON condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll({} , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('finds all records with a null JSON condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll(null , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('finds all records with a populated JSON condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll({username: 'fred'} , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('updates a record with JSON condition', function(done){
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.update({username: 'fredUpdated'}, {email: 'fred@moneytribe.com.au'}, function(err, result){
        should.not.exist(err);
        result.should.be.ok;
        done();
      });
    })
  })

  it('updates a record with an empty object JSON condition', function(done){
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.update({username: 'fredUpdated'}, {}, function(err, result){
        should.not.exist(err);
        result.should.be.ok;
        done();
      });
    })
  })

  it('updates a record with an empty object JSON condition', function(done){
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.update({username: 'fredUpdated'}, null, function(err, result){
        should.not.exist(err);
        result.should.be.ok;
        done();
      });
    })
  })

  it('checks for results in an update result before trying to access them', function(done){
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    User.update({}, {username: 'noMatch'}, function(err, user){
      should.exist(err);
      done();
    });
  })

  it('tolerates creation with object properties that do not map to the Collection', function(done){
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99'
          , username: 'fred'
          , email: 'fred@moneytribe.com.au'
          , nonsenseField: 'BOO'};

    User.create(data, function(err, user){
      should.not.exist(err);
      should.exist(user);
      user.username.should.equal('fred');
      should.not.exist(user.nonsenseField);
      done();
    });
  });

  it('tolerates update with object properties that do not map to the Collection', function(done){
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99'
          , username: 'fred'
          , email: 'fred@moneytribe.com.au'
          , nonsenseField: 'BOO'};

    User.create(data, function(err, user){
      User.update(data, {id: user.id}, function(err, result){
        result.should.be.ok
        done();
      })
    });
  });

  it('counts records with an empty object JSON condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.count({} , function(err, count){
        should.exist(count);
        count.should.equal(1);
        done();
      });
    });
  });

  it('counts records with a null JSON condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.count(null , function(err, count){
        should.exist(count);
        count.should.equal(1);
        done();
      });
    });
  });

  it('counts records with a populated JSON condition', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.count({ username: 'fred'} , function(err, count){
        should.exist(count);
        count.should.equal(1);
        done();
      });
    });
  });

  it('returns zero count if it cannot find a match', function(done) {
    var User = Collection.model('User', helper.userConfig, null, "testdb");

    User.count({ username: 'fred'} , function(err, count){
      should.exist(count);
      count.should.equal(0);
      done();
    });
  });
});

describe('Collection level behaviours', function(done) {
  beforeEach(function(done){
    helper.configure(new Connection.PostgreSQL(env.connectionString), new SQLAdapter(), "testdb", done);
  });

  beforeEach(function(done){
     helper.resetDb(helper.accountSQL, done);
  })

  afterEach(function(){
    Downstairs.clear();
  });

  it('it finds the max without a JSON search condition', function(done) {
    var Account = Collection.model('Account', helper.accountConfig, null, "testdb");
    var data = {balance: 555, user_id:1};
    ectypes.Account.create(data, function(err, results) {

      var data2 = {balance: 999, user_id:2};
      ectypes.Account.create(data2, function(err2, results2) {

        Account.max({max:'balance'} , function(err, max){
          should.exist(max);
          max.should.equal(999);
          done();
        });
      });
    });
  });

});


var Repeatable;

describe('node-sql augmentations',  function(done){
  beforeEach(function(done){
    helper.configure(new Connection.PostgreSQL(env.connectionString), new SQLAdapter(), "testdb", done);
  })

  beforeEach(function(done){
    helper.resetDb(helper.repeatableSQL + helper.userSQL, done);
  })

  beforeEach(function(){
    Repeatable = Collection.model('Repeatable', helper.repeatableConfig, null, "testdb");
  })

  describe('limit', function(done){
    var firstRepeatable, secondRepeatable, thirdRepeatable;

    beforeEach(function(done){
      Repeatable.create({name: 'blue'}, function(err, repeatable){
        firstRepeatable = repeatable;
        Repeatable.create({name: 'blue'}, function(err, repeatable){
          secondRepeatable =  repeatable;
          Repeatable.create({name: 'blue'}, function(err, repeatable){
            thirdRepeatable = repeatable;
            done();
          })
        })
      })
    })

    it('parses limit in queryParameters of conditions', function(done) {
      var data = {queryParameters: { limit: 2 } };

      Repeatable.findAll(data, function(err, repeatables){
        repeatables.length.should.equal(2); //if it's 3, we have an error with limit
        done();
      });
    });
  });


  describe('order by', function(done){
    var User;
    beforeEach(function(){
      User = Collection.model('User', helper.userConfig, null, "testdb");
    });

    beforeEach(function(done){
      var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'andrew', email: 'andrew@moneytribe.com.au'};

      ectypes.User.create(data, function(err, results) {
        var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'zack', email: 'zack@moneytribe.com.au'};
        ectypes.User.create(data, function(err, results) {
          done()
        })
      })
    })

    it('parses order by DESC', function(done) {
      User.findAll({queryParameters: {orderBy: 'username DESC'}}, function(err, users){
        users[0].username.should.equal('zack');
        users[1].username.should.equal('andrew');
        done()
      });
    });

    it('parses order by ASC', function(done) {
      User.findAll({queryParameters: {orderBy: 'username ASC'}}, function(err, users){
        users[0].username.should.equal('andrew');
        users[1].username.should.equal('zack');
        done()
      });
    });

    it('parses multiple order bys', function(done){
      var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'anthony', email: 'anthony@moneytribe.com.au'};
      ectypes.User.create(data, function(err, user){
        User.findAll({queryParameters: {orderBy: 'id ASC, username DESC'}}, function(err, users){
          users[0].username.should.equal('andrew');
          users[1].username.should.equal('zack');
          users[2].username.should.equal('anthony');
          done()
        });
      });
    });
  })
});