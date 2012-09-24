var downstairs = require('../lib/downstairs.js')
  , should = require('should')
  , sql = require('sql');

describe('Table registration', function(){
  it('returns a Model (a constructor function), with a mappings property', function(){
    var sql = sql.Table.define({
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

    var User = Table.register(sql);
    should.exist(User);
    User.sqlGenerator.should.equal(sql);
  })
})