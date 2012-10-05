var pg = require('pg');

module.exports = function(connectionString) {
  this.connectionString = connectionString;

  var _self = this;

  this.query = function(query, cb) {
    pg.connect(_self.connectionString, function(err, client) {
      //log connection errors
      client.query(query, function(err, result) {
        //log query errors
        cb(err, result);
      });
    });
  };

}

