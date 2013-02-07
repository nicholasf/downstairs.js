// var redis = require('redis');

// var RedisConnection = function(port, host, database, options){
//   this.port = port;
//   this.host = host;
//   this.database = database;
//   this.client = redis.createClient(port, host);
//   this.client.select(database);
// }

// RedisConnection.prototype.query = function(command, args, cb){
//   connection =  this;
//   this.client.set("string key", "string val", function(err, reply){
//     console.log(reply, " <<<< 0");

//     var func = connection.client[command];

//     func.apply(connection.client, args, function(err, resp){
//       console.log(arguments, "<<<< 2");
//       cb(err, resp);
//     });

//   })

// };

// module.exports = RedisConnection;
