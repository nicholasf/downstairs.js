var pg = require('pg');
var Connection = require('./connection');

var PGConnection = Connection;

PGConnection.prototype.query = function(query, cb) {
    pg.connect(this.connectionString, function(err, client) {
      //log connection errors
      client.query(query, function(err, result) {
        //log query errors
        cb(err, result);
      });
    });
  };

module.exports = PGConnection;

// module.exports = function(connectionString) {
//   this.connectionString = connectionString;

//   var _self = this;

//   this.query = function(query, cb) {
//     pg.connect(_self.connectionString, function(err, client) {
//       //log connection errors
//       client.query(query, function(err, result) {
//         //log query errors
//         cb(err, result);
//       });
//     });
//   };

// }

