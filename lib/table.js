var Table = {}
  , async = require('async')
  , _ = require('underscore')
  , Model = require('./model');
  
//Table.registry = {};
Table.Downstairs;

Table.use = function(Downstairs){
  Table.Downstairs = Downstairs;
}

/*
 * mixin behaviours for all models go here
 */
Table.findAll = function(conditions, cb){
  var results = [];

  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  var sqlStr;
  var sqlBaseQuery = this.sql.select(this.sql.star()).from(this.sql);
  if (conditions){
    sqlBaseQuery = sqlBaseQuery.where(conditions);
  }

  sqlStr = sqlBaseQuery.toQuery();

  var _self = this;
  var _cb = cb;

  var finderAllCb = function(err, results){
    var models = [];

    if (results){
      for (var i in results.rows){
        var model = new _self(results.rows[i]);
        models.push(model);
      }
    }
    
    _cb(err, models);
  }

  this.connection.query(sqlStr, finderAllCb);
};

Table.find = function(conditions, cb){
  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  var findCb = function(err, models){
    cb(err, models[0]);
  }

  this.findAll(conditions, findCb);
};

Table.update = function(data, conditions, cb){
  if (typeof data === 'function'){
    cb = data;
    data = null;
    conditions = null;
  }

  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  if (!conditions && data) {
    if (data.nodes && data.left && data.right) {
      // Sniff for a where clause condition object
      conditions = data;
      data = null;
    }
  }

  var _cb = cb;

  if (!data || typeof data === 'function') {
    return _cb({message: 'No data was provided'}, false);
  }

  var sqlStr;
  var sqlBaseQuery = this.sql.update(data);

  if (conditions){
    sqlBaseQuery = sqlBaseQuery.where(conditions);
  }

  sqlStr = sqlBaseQuery.toQuery();

  var updateCb = function(err, results){
    var result = false;
    if (results.rowCount > 0 && results.command === 'UPDATE') {
      result = true;
    }

    _cb(err, result);
  }
  
  this.connection.query(sqlStr, updateCb);
}

Table.create = function(data, cb){
  if (typeof data === 'function') {
    cb = data;
    data = null;
  }

  var _cb = cb;

  if (!data || typeof data === 'function') {
    return _cb({message: 'No data was provided'}, false);
  }

  var sqlStr;
  var sqlBaseQuery = this.sql.insert(data);

  sqlStr = sqlBaseQuery.toQuery();

  var createCb = function(err, results){
    var result = false;
    if (results.rowCount > 0 && results.command === 'INSERT') {
      result = true;
    }

    _cb(err, result);
  }

  this.connection.query(sqlStr, createCb);
}

Table.delete = function(data, cb) {
  if (typeof data === 'function') {
    cb = data;
    data = null;
  }

  var _cb = cb;

  var sqlStr;
  var sqlBaseQuery = this.sql.delete(data);

  sqlStr = sqlBaseQuery.toQuery();

  var deleteCb = function(err, results) {
    var result = false;
    if (!err) {
      result = true;
    }

    _cb(err, result);
  }

  this.connection.query(sqlStr, deleteCb);
}

var mixinTableFunctions = function(obj){
  for (var property in Table){
    if (property === "model"){ continue }

    if (typeof Table[property] === 'function'){
      obj[property] = Table[property];
    }
  }
}

/*
 * The model function creates a Model constructor function
 * & copies all Table level behaviours onto the Model
 * & copies the node-sql object onto the Model.
 */
Table.model = function(name, sql, validations, connectionName){
  var dbConnection;

  if (connectionName){
    dbConnection = Table.Downstairs.get(connectionName);
  } else {
    dbConnection = Table.Downstairs.get('default');
  }

  Model.connection = dbConnection;
  Model.sql = sql;
  Model.prototype.sql = sql;
  Model.Downstairs = Table.Downstairs;
  Model.name = name;
  Model.prototype.validations = validations;

  mixinTableFunctions(Model);
  dbConnection.register(name, Model);
  return Model;
}

module.exports = Table;