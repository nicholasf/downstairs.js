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
    name = 'default';
  }

  if (connection && connection.connectionString) {
    Downstairs.connections[name] = connection;
  } else {
    throw new Error('You cannot add a connection without a connection string.');
  }
};

Downstairs.get = function(connectionName){
  if (!connectionName) {
    connectionName = 'default';
  }
  return Downstairs.connections[connectionName];
};

Downstairs.clear = function() {
  Downstairs.connections = {};
}

Downstairs.Table = Table;
Downstairs.Connection = Connection;
module.exports = Downstairs;
