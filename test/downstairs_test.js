var Downstairs = require('../lib/downstairs.js').Downstairs
  , should = require('should')
  , env = require('./../config/env')
  , helper = require('./helper')

describe('Downstairs', function(){
  beforeEach(function(done){
    var fooSQL = "CREATE TABLE foo (id int, name character varying(50));"
    helper.resetDb(fooSQL, done);
  })

  it('can connect to the database', function(done) {
    Downstairs.go(env.connectionString);
    Downstairs.query('SELECT * FROM foo;', function(err, results) {
      should.exist(results);
      done();
    })
  });
});
