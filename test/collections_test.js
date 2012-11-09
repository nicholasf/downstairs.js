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

var userSQL = sql.Table.define({
  name: 'users'
  , quote: true
  , schema: 'public'
  , columns: ['id' 
    , 'username' 
    , 'created_at'
    , 'updated_at'
    , 'is_active'
    , 'email'
    //, 'null_field'
    , 'password'
  ]
});

var roleSQL = sql.Table.define({
  name: 'roles'
  , quote: true
  , columns: ['id' 
    , 'name' 
  ]
});

describe('Collections creating Model constructors', function(done){
  it('returns a Model (a constructor function), with a mappings property', function(){
    var User = Collection.model('User', userSQL);
    should.exist(User);
    User.sql.should.equal(userSQL);
  });

  it('copies Collection level behaviours onto the Model', function(){
    var User = Collection.model('User', userSQL);
    should.exist(User.findAll);
  });

  it('does not copy the Collection.model function onto the Model', function(){
    var User = Collection.model('User', userSQL);
    should.not.exist(User.register);
  });

  it('does not confuse sql objects when multiple models are declared', function(){
    var User = Collection.model('User', userSQL);
    var Role = Collection.model('Role', roleSQL);   
    User.sql.should.equal(userSQL);
    Role.sql.should.equal(roleSQL); 
  });
});

describe('Collection level behaviours', function(done) {
  beforeEach(function(done){
     helper.resetDb(helper.userCollectionSQL, done);
  })

  it('finds a record with a where JSON condition', function(done) {
    var User = Collection.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {
      User.find({ username: 'fred', email: 'fred@moneytribe.com.au' } , function(err, user){
        should.exist(user);
        user.username.should.equal('fred');
        done();
      });
    });
  });

  it('finds a record with a where JSON condition including a null field', function(done) {
    var User = Collection.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au' };
    ectypes.User.create(data, function(err, results) {

      User.find({ username: 'fred', null_field: null } , function(err, user){
        should.exist(user);
        user.username.should.equal('fred');
        done();
      });
    });
  });

  it('finds all records with an empty object JSON condition', function(done) {
    var User = Collection.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll({} , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('finds all records with a null JSON condition', function(done) {
    var User = Collection.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll(null , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('finds all records with a populated JSON condition', function(done) {
    var User = Collection.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.findAll({username: 'fred'} , function(err, user){
        should.exist(user);
        done();
      });
    });
  });

  it('updates a record with JSON condition', function(done){
    var User = Collection.model('User', userSQL);
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
    var User = Collection.model('User', userSQL);
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
    var User = Collection.model('User', userSQL);
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
    var User = Collection.model('User', userSQL);
    User.update({}, {username: 'noMatch'}, function(err, user){
      should.exist(err);
      done();
    });
  })

  it('tolerates creation with object properties that do not map to the Collection', function(done){
    var User = Collection.model('User', userSQL);
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
    var User = Collection.model('User', userSQL);
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
    var User = Collection.model('User', userSQL);
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
    var User = Collection.model('User', userSQL);
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
    var User = Collection.model('User', userSQL);
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
    var User = Collection.model('User', userSQL);

    User.count({ username: 'fred'} , function(err, count){
      should.exist(count);
      count.should.equal(0);
      done();
    });
  });
});

var repeatableSchema = sql.Table.define({
  name: 'repeatables'
  , quote: true
  , schema: 'public'
  , columns: ['id'
   , 'name']
});

var Repeatable = Collection.model('Repeatable', repeatableSchema);

describe('node-sql augmentations',  function(done){

  beforeEach(function(done){
    helper.resetDb(helper.repeatableCollectionSQL + helper.userCollectionSQL, done);
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
            // Repeatable.findAll({}, function(err, repeatables){
            //   console.log(repeatables.length, " <<<<<");
            // })
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

  })

  // it('parses offset in queryParameters of conditions', function(done) {
  //   var data = { queryParameters: { offset: 2 } };

  //   repeatable.findAll(data, function(err, repeatables){
  //     repeatables.length.should.equal(1); //if it's 3, we have an error with limit
  //     repeatables[0].id.should.equal(thirdrepeatable.id);
  //     done();
  //   });
  // });

  describe('order by', function(done){

    var User = Collection.model('User', userSQL);

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
  })
});