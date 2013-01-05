var Connection = require('./../../lib/connections/connection')
  , Downstairs = require('../../lib/downstairs')
  , should = require('should')
  , Table = Downstairs.Table
  , helper = require('./../helper');

describe("configurations locate Model", function(){
  it("access the Model via name", function(){
    var connection = new Connection();
    connection.connectionString = 'connection string';
    var dummyAdapter = {};
    var configuration = Downstairs.configure(connection, dummyAdapter);
    var User = Table.model('User', helper.userSQL);
    should.exist(configuration.models.User);
    User.should.equal(configuration.models.User);
  })
})