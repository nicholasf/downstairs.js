var Downstairs = {};
var Collection = require('./collection')
var pg = require('pg')
  , async = require('async')
  , _ = require('underscore')
  , Connection = require('./connections');

Downstairs.configurations = {};
Collection.use(Downstairs);

var Configuration = function(connection, adapter){
  this.connection = connection;
  this.adapter = adapter;
  this.models = {};

  /**
   ** A Configuration tracks its models.
   **/
  this.register = function(modelName, Model) {
    this.models[modelName] = Model;
  };
}

/**
 ** Call to add a connection, adapter, and name combination into Downstairs.
 ** Collections, when configured, indicate which connection they should use.
**/
Downstairs.add = function(connection, adapter, name){
  if (!connection){
    throw new Error("Please specify a database adapter to use (e.g. Downstairs.add(connection, node-sql)");    
  }

  if (!adapter){
    throw new Error("Please specify a database adapter to use (e.g. Downstairs.add(connection, node-sql)");
  }

  if (!name) {
    console.log("Configuring an unnamed connection. Using 'default'. Two unnamed connections will write over each other.")
    name = 'default';
  }

  if (connection && (connection.url || connection.connectionString)) {
    Downstairs.configurations[name] = new Configuration(connection, adapter);
  } else {
    throw new Error('You cannot add a connection without a URL (connection.url).');
  }
};

Downstairs.get = function(configurationName){
  if (!configurationName) {
    configurationName = 'default';
  }
  return Downstairs.configurations[configurationName];
};

/** Handy for tests. **/
Downstairs.clear = function() {
  Downstairs.configurations = {};
}

Downstairs.Collection = Collection;
/** Use Collection, not Table. Table will one day be deprecated. **/
Downstairs.Table = Collection; 
Downstairs.Connection = Connection;
module.exports = Downstairs;
