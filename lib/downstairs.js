var Downstairs = {};
var Table = {};
Table.registry = {};
var pg = require('pg')
  , async = require('async');

Downstairs.go = function(connectionstring){
  Downstairs.conn = connectionstring;
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
    for (var i in results.rows){
      var model = new _self(results.rows[i]);
      models.push(model);
    }
    _cb(err, models);
  }

  this.Downstairs.query(sqlStr, finderAllCb);
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
  
  this.Downstairs.query(sqlStr, updateCb);
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

  this.Downstairs.query(sqlStr, createCb);
}


var createValidator = function(model, validationName){
  return function(cb){
    model[validationName](cb);
  }
}

/*
 * The register function creates a Model constructor function
 * & copies all Table level behaviours onto the Model
 * & copies the node-sql object onto the Model.
 */
Table.register = function(sql, validations){
  var Model = function(properties){
    this.properties = properties;
    this._isNew = true;
    this._isDirty = false;

    for (var prop in properties){
      this[prop] = properties[prop];
    }

    if (this.id) { this._isNew = false; }
    this.validations = validations;

    var validationCycle = [];

    for (var validation in this.validations){
      this[validation] = this.validations[validation];

      var _self = this;
      validationCycle.push(createValidator(this, validation));
    }

    this.validate = function(cb){
      if (typeof this.validations === 'undefined'){
        cb("Define validations on the model first.", null);
      }

      async.parallel(validationCycle, function(err, results){
        cb(err, results);
      });
    }
  };

  Model.sql = sql;
  Model.Downstairs = Downstairs;

  for (var property in Table){
    if (property === "register"){ continue }

    if (typeof Table[property] === 'function'){
      Model[property] = Table[property];
    }
  }

  Table.registry[sql._name] = {sql: sql, model: Model};
  return Model;
}

exports.Table = Table;
exports.Downstairs = Downstairs;
