var Downstairs = {};
var Table = require('./table');
var pg = require('pg')
  , async = require('async')
  , _ = require('underscore');

Downstairs.go = function(connectionstring){
  Downstairs.conn = connectionstring;
  Table.connectionString = connectionstring;
} 

Downstairs.query = function(query, cb) {
  pg.connect(Downstairs.conn, function(err, client) {
    //log connection errors
    client.query(query, function(err, result) {
      //log query errors
      cb(err, result);
    });
  });
}

exports.Table = Table;
exports.Downstairs = Downstairs;
