var Table = require('../lib/downstairs.js').Table
  , should = require('should')
  , sql = require('sql');

var userSQL = sql.Table.define({
  name: 'user'
  , quote: true
  , columns: ['id' 
    , 'username' 
    , 'created_at'
    , 'updated_at'
    , 'is_active'
    , 'email'
    , 'password'
  ]
});


describe('Table registration', function(){
  it('returns a Model (a constructor function), with a mappings property', function(){
    var User = Table.register(userSQL);
    should.exist(User);
    User.sql.should.equal(userSQL);
  })

  it('copies Table level behaviours onto the Model', function(){
    var User = Table.register(userSQL);
    should.exist(User.findAll);
  })

  it('does not copy the Table.register function onto the Model', function(){
    var User = Table.register(userSQL);
    should.not.exist(User.register);
  })
})