var Connection = require('./../../lib/connections')
  , Downstairs = require('./../../lib/downstairs')
  , should = require('should')
  , env = require('./../../config/env')
  , helper = require('./../helper')
  , SQLAdapter = require('./../../lib/adapters/sql')    
  , Table = require('./../../lib/table');

var pgConnection = new Connection.PostgreSQL(env.connectionString);
var sqlAdapter = new SQLAdapter();
Downstairs.configure(pgConnection, sqlAdapter);
Collection.use(Downstairs);

describe('Connections, assuming that the downstairs_test db exists', function(){
  it('can execute a query', function(done){
    var queryString = "select version()";

    pgConnection.query(queryString, function(err, result){
      should.not.exist(err);
      should.exist(result);
      should.exist(result.rows[0].version);
      result.rows[0].version.should.be.a('string');
      done();
    })
  });
});
