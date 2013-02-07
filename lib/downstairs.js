/**
 ** Top level context for setting up and managing configurations.
 ** A Configuration is an adapter, a connection and, optionally,
 ** a name.
 **/

var Downstairs = {};
var pg = require('pg')
  , async = require('async')
  , _ = require('underscore')
  , Connection = require('./connections')
  , Adapters = require('./adapters');

Downstairs.configurations = {};
Downstairs.defaultConfiguration = "default";

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
Downstairs.configure = function(connection, adapter, name){
  var configuration;

  if (!connection){
    throw new Error("Please specify a database connection to use (e.g. Downstairs.add(connection, node-sql)");
  }

  if (!adapter){
    throw new Error("Please specify a database adapter to use (e.g. Downstairs.add(connection, node-sql)");
  }

  if (!name) {
    console.log("Configuring an unnamed connection. Using 'default'. Two unnamed connections will write over each other.")
    name = 'default';
  }

  configuration =  new Configuration(connection, adapter);
  Downstairs.configurations[name] = configuration;

  return configuration;
};

Downstairs.add = Downstairs.configure; /** deprecate the add method later **/

Downstairs.get = function get(configurationName){
  if (!configurationName) {
    configurationName = 'default';
  }
  return Downstairs.configurations[configurationName];
};

/** Handy for tests. **/
Downstairs.clear = function() {
  Downstairs.configurations = {};
}

module.exports = Downstairs;
/**
 ** Now load the collection, so it can require Downstairs & have the functionality it needs.
 **/
var Collection = require('./collection');

Downstairs.Collection = Collection;
/** Use Collection, not Table. Table will one day be deprecated. **/
Downstairs.Table = Collection;
Downstairs.Connection = Connection;
Downstairs.Adapters = Adapters;
