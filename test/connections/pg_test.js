var Connection = require('./../../lib/connections')
  , Downstairs = require('./../../lib/downstairs')
  , should = require('should')
  , env = require('./../../config/env')
  , helper = require('./../helper')
  , Table = require('./../../lib/table');

var pgConnection;

describe('Connections, assuming that the downstairs_test db exists', function(){

  beforeEach(function() {
    pgConnection = new Connection.PostgreSQL(env.connectionString);
    Downstairs.add(pgConnection);
  });

  it('can create a default connection object', function() {
    should.exist(pgConnection);
  });

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

  it('has a registry of Models', function(done) {
    var userSQL = helper.userSQL;
    var User = Table.model('User', userSQL);

    should.exist(pgConnection.modelConstructors);
    should.exist(pgConnection.modelConstructors.User);
    done();
  });
});
