var Downstairs = {};
var Collection = require('./collection')
var pg = require('pg')
  , async = require('async')
  , _ = require('underscore')
  , Connection = require('./connections');

Downstairs.connections = {};
Collection.use(Downstairs);

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

Downstairs.Collection = Collection;
Downstairs.Table = Collection;
Downstairs.Connection = Connection;
module.exports = Downstairs;
