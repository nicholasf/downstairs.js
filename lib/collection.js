var Collection = {}
  , async = require('async')
  , _ = require('underscore')
  , Record = require('./record')
  , lingo = require('lingo');
  
Collection.Downstairs;

Collection.use = function(Downstairs){
  Collection.Downstairs = Downstairs;
}

var jsonConditionsToSQL = function(Model, conditions){
  var clauses = [];
  for (var key in conditions){
    if (Model.sql[key]) {
      if (typeof conditions[key] === 'null') {
        var clause = Model.sql[key].isNull();
        clauses.push(clause);
      }
      else if (conditions[key]) {
        var clause = Model.sql[key].equals(conditions[key]);
        clauses.push(clause);
      }

    }
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

var parseConditions = function (conditions, _self, sqlBaseQuery) {
  if (conditions){
    var sqlConditions = jsonConditionsToSQL(_self, conditions);
    if (sqlConditions) {
      return sqlBaseQuery.where(sqlConditions);
    }
  }

  return sqlBaseQuery;
}

var cleanData = function(sql, data){
  var objectKeys = _.keys(data);
  var differences = _.difference(objectKeys, sql._initialConfig.columns);

  differences.forEach(function(diff){
    delete data[diff];
  })

  return data;
}

/*
 * Mixin behaviours for all models go here
 */
Collection.findAll = function(conditions, cb){
  var results = [];

  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  var sqlStr;
  var sqlBaseQuery = this.sql.select(this.sql.star()).from(this.sql);
  sqlBaseQuery = parseConditions(conditions, this, sqlBaseQuery);
  sqlStr = sqlBaseQuery.toQuery();

  if (conditions && conditions.queryParameters){

    if (conditions.queryParameters.orderBy){      
      sqlStr.text = sqlStr.text + " ORDER BY " + conditions.queryParameters['orderBy'];      
    }

    if (conditions.queryParameters.limit){
      sqlStr.text = sqlStr.text + " LIMIT " + conditions.queryParameters['limit'];
    }

    // if (conditions.queryParameters.offset){
    //   sqlStr.text = sqlStr.text + " OFFSET " + conditions.queryParameters['offset'];      
    // }
  }

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

  if (!this.connection.connectionString) {
    this.connection.connectionString = this.Downstairs.connectionString;
  }

  this.connection.query(sqlStr, finderAllCb);
};

Collection.find = function(conditions, cb){

  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  var findCb = function(err, models){
    if (models && models[0]) {
      cb(err, models[0]);
    }
    else {
      cb(err, null);
    }
  }

  this.findAll(conditions, findCb);
};

Collection.count = function(conditions, cb){
  var results = [];

  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  var sqlStr;
  var sqlBaseQuery = this.sql.select('COUNT(*)').from(this.sql);
  sqlBaseQuery = parseConditions(conditions, this, sqlBaseQuery);
  sqlStr = sqlBaseQuery.toQuery();

  var _self = this;
  var _cb = cb;

  var countCb = function(err, results){
    if (results && results.rows && results.rows[0] && results.rows[0].count) {
      _cb(err, results.rows[0].count);
    }
    else {
      _cb(err, 0);
    }
  }

  if (!this.connection.connectionString) {
    this.connection.connectionString = this.Downstairs.connectionString;
  }

  this.connection.query(sqlStr, countCb);
};

Collection.update = function(data, conditions, cb){
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

  data = cleanData(this.sql, data);

  var sqlStr;
  var sqlBaseQuery = this.sql.update(data);
  sqlBaseQuery = parseConditions(conditions, this, sqlBaseQuery);

  sqlStr = sqlBaseQuery.toQuery();  
  sqlStr.text = sqlStr.text + " RETURNING id;"

  var _self = this;

  var updateCb = function(err, results){
    if (results && results.rowCount > 0) {
      return _self.find({id: results.rows[0].id}, cb);
    }

    _cb(err, null);
  }
  
  this.connection.query(sqlStr, updateCb);
}

Collection.create = function(data, cb){
  if (typeof data === 'function') {
    cb = data;
    data = null;
  }

  var _cb = cb;

  if (!data || typeof data === 'function') {
    return _cb({message: 'No data was provided'}, false);
  }

  data = cleanData(this.sql, data);

  var sqlStr;
  var sqlBaseQuery = this.sql.insert(data);

  sqlStr = sqlBaseQuery.toQuery();
  sqlStr.text = sqlStr.text + " RETURNING id;"

  var _self = this;
  var queries = {};

  _self.connection.query(sqlStr, function(err, result){
    if (err){ return cb(err, result) };

    if (result && result.rowCount > 0) {
      return _self.find({id: result.rows[0].id}, cb);
    }
    else {
      cb(err, result);
    }
  });
}

Collection.delete = function(data, cb) {
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

Collection.belongsTo = function(model){
  var belongsToFunctionName = model.name2.toLowerCase();
  var foreignKeyName = belongsToFunctionName + "_id"; //oneday this will be configurable

  var belongsTo = function(cb){ 
    return model.find({id: this[foreignKeyName]}, cb) 
  };

  this.prototype[belongsToFunctionName] = belongsTo;
}


Collection.hasOne = function(model){
  var keyName = this.name2.toLowerCase();
  var hasOneFunctionName = model.name2; 
  hasOneFunctionName = hasOneFunctionName.toLowerCase();
  var foreignKeyName =  keyName + "_id"; //oneday this will be configurable

  var hasOne = function(cb){ 
    return model.find({id: this[foreignKeyName]}, cb) 
  };

  this.prototype[hasOneFunctionName] = hasOne;
}

Collection.hasMany = function(model){
  var keyName = this.name2.toLowerCase();
  var hasManyFunctionName = lingo.en.pluralize(model.name2); 
  hasManyFunctionName = hasManyFunctionName.toLowerCase();
  var foreignKeyName =  keyName + "_id"; //oneday this will be configurable

  var hasMany = function(cb){ 
    return model.findAll({id: this[foreignKeyName]}, cb) 
  };

  this.prototype[hasManyFunctionName] = hasMany;
}

var mixinCollectionFunctions = function(obj){
  for (var property in Collection){
    if (property === "model"){ continue }

    if (typeof Collection[property] === 'function'){
      obj[property] = Collection[property];
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
 * & copies all Collection level behaviours onto the Model
 * & copies the node-sql object onto the Model.
 */
Collection.model = function(name, sql, validations, connectionName){
  var dbConnection;

  if (connectionName){
    dbConnection = Collection.Downstairs.get(connectionName);
  } else {
    dbConnection = Collection.Downstairs.get('default');
  }

  var Model = function(properties){
    this.properties = properties;
    var validationCycle = [];
    var record = this;

    for (var prop in properties){
      this[prop] = this.properties[prop];
    }

    for (var validation in this.validations){
      this[validation] = this.validations[validation];
      var _self = this;
      validationCycle.push(createValidator(record, validation));
    }

    this.isValid = function(cb){
      if (typeof this.validations === 'undefined'){
        return cb(null, true);
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

  Model.name = name;
  Model.name2 =  name;

  Model.prototype = new Record();
  Model.prototype.constructor = Record;

  Model.connection = dbConnection;
  Model.sql = sql;
  Model.Downstairs = Collection.Downstairs;
  Model.prototype.validations = validations;
  Model.prototype._model = Model;


  mixinCollectionFunctions(Model);

  if (!dbConnection){
    throw new Error('There is no connection defined. Make sure you have called Downstairs.add(connection)');
  }
  else {
//    console.log(dbConnection.register, " <<<< the dbConnection.register function ... This call is uniform before all tests");
    dbConnection.register(name, Model);
  }
  return Model;
}

module.exports = Collection;