var pg = require('pg');

var PGConnection = function(url) {
  this.url = url;
};

PGConnection.prototype.query = function(query, cb){
  pg.connect(this.url, function(err, client) {
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

