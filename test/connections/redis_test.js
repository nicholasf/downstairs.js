var Connection = require('./../../lib/connections')
  , Downstairs = require('./../../lib/downstairs')
  , should = require('should')
  , env = require('./../../config/env')
  , helper = require('./../helper')
  , RedisAdapter = require('./../../lib/adapters/redis')    
  , Collection = Downstairs.Collection;

var connection = new Connection.Redis(env.redis.port, env.redis.host);
var adapter = new RedisAdapter();
Downstairs.configure(adapter, adapter);
Collection.use(Downstairs);

describe('Connections, assuming that the 2 db exists', function(){
  it('can execute a command', function(done){
    var command = "set";
    var args = ["testKey", "testVal"];

    connection.query(command, args, function(err, reply){
      should.not.exist(err);
      console.log(reply);
      done();
    })
  });
});
