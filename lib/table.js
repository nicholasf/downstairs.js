var Table = {}
  , async = require('async')
  , _ = require('underscore')
  , Model = require('./model');
  
Table.Downstairs;

Table.use = function(Downstairs){
  Table.Downstairs = Downstairs;
}

var jsonConditionsToSQL = function(Model, conditions){
  var clauses = [];
  for (var key in conditions){
    var clause = Model.sql[key].equals(conditions[key]);
    clauses.push(clause);
  }

  var anded = ander(clauses);
  return anded;
}

var ander = function(clauses){
  var base = clauses.shift();

  var chainer = function(clause){
    base = base.and(clause);
  };

  clauses.forEach(chainer, base);
  return base;  
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
    var conditions = jsonConditionsToSQL(this, conditions);
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
  var _self = this;

  var createCb = function(err, results){
    if (results) {
      return _self.find(data, cb);
    } else {
      return _cb(err, null);
    }
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

var createValidator = function(model, validationName){
  return function(cb){
    model[validationName](cb);
  }
};

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

  var ModelImpl = function(properties){
    this.properties = properties;
    var validationCycle = [];
    var _modelImplInstance = this;

    for (var prop in properties){
      this[prop] = this.properties[prop];
    }

      
    for (var validation in this.validations){
      this[validation] = this.validations[validation];
      var _self = this;
      validationCycle.push(createValidator(_modelImplInstance, validation));
    }

    this.isValid = function(cb){
      if (typeof this.validations === 'undefined'){
        cb("Define validations on the model first.", null);
      }

      async.parallel(validationCycle, function(err, results){
        var validationErrors = _.filter(results, function(result){ return result != null});
        if (validationErrors.length == 0){ 
          validationErrors = null 
        }

        cb(validationErrors, validationErrors == null);
      });
    }
  };

  ModelImpl.prototype = new Model();
  ModelImpl.prototype.constructor = Model;

  ModelImpl.connection = dbConnection;
  ModelImpl.sql = sql;
  ModelImpl.prototype.sql = sql;
  ModelImpl.Downstairs = Table.Downstairs;
  ModelImpl.name = name;
  ModelImpl.prototype.validations = validations;

  mixinTableFunctions(ModelImpl);

  dbConnection.register(name, ModelImpl);
  return ModelImpl;
}

module.exports = Table;