var Downstairs = {};
var Table = require('./table');
var pg = require('pg')
  , async = require('async')
  , _ = require('underscore')
  , Connection = require('./connections');

Downstairs.connections = {};
Table.use(Downstairs);

Downstairs.add = function(connection, name){
  if (!name) {
    name = "default";
  }

  Downstairs.connections[name] = connection;
};

Downstairs.get = function(connectionName){
  return Downstairs.connections[connectionName];
};

Downstairs.Table = Table;
Downstairs.Connection = Connection;
module.exports = Downstairs;

