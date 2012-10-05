var Downstairs = {};
var Table = require('./table');
var pg = require('pg')
  , async = require('async')
  , _ = require('underscore');

Downstairs.connections = {};

Downstairs.add = function(connection, name){
  if (!name) {
    name = "default";
  }

  Downstairs.connections[name] = connection;
} 

Downstairs.get = function(connectionName){
  return Downstairs.connections[connectionName];
}

exports.Table = Table;
exports.Downstairs = Downstairs;
