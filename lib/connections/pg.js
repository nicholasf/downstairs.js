var pg = require('pg');
var Connection = require('./connection');

var PGConnection = Connection;

PGConnection.prototype.query = function(query, cb){
  pg.connect(this.connectionString, function(err, client) {
    if (err) {
      return cb(err, client)
    }
    client.query(query, function(err, result) {
      //log query errors
      cb(err, result);
    });
  });
};

module.exports = PGConnection;
