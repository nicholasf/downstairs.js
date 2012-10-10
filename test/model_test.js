var Downstairs = require('../lib/downstairs')
  , Table = Downstairs.Table
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , Connection = Downstairs.Connection;

Table.use(Downstairs);

var userSQL = sql.Table.define({
  name: 'users'
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

describe('A model can connect to the database', function() {
  it('has a connection', function() {
    var myDefaultPGConnection;
    myDefaultPGConnection = new Connection.PostgreSQL(env.connectionString);
    Downstairs.add(myDefaultPGConnection);
    var User = Table.model('User', userSQL);
    should.exist(User.connection);
  });

});
