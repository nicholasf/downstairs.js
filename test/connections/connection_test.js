var Connection = require('./../../lib/connections/connection')
  , Downstairs = require('../../lib/downstairs')
  , should = require('should')
  , Table = Downstairs.Table
  , helper = require('./../helper');

describe("connections locating Model", function(){
  it("access the Model via name", function(){
    var connection = new Connection();
    connection.connectionString = 'connection string';
    Downstairs.add(connection);
    var User = Table.model('User', helper.userSQL);
    should.exist(connection.modelConstructors.User);
    User.should.equal(connection.modelConstructors.User);
  })
})