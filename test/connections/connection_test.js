var Connection = require('./../../lib/connections/connection')
  , Downstairs = require('../../lib/downstairs')
  , should = require('should')
  , Table = Downstairs.Table
  , env = require('./../../config/env')
  , helper = require('./../helper');

var pgConnection = new Connection.PostgreSQL(env.connectionString);
var sqlAdapter = new SQLAdapter();
Downstairs.configure(pgConnection, sqlAdapter);
Collection.use(Downstairs);

describe("configurations locate Model", function(){
  it("access the Model via name", function(){
    var User = Table.model('User', helper.userSQL);
    should.exist(configuration.models.User);
    User.should.equal(configuration.models.User);
  })
})