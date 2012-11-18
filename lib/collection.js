var Collection = {}
  , async = require('async')
  , _ = require('underscore')
  , Record = require('./record')
  , lingo = require('lingo');
  
Collection.use = function(Downstairs){
  Collection.Downstairs = Downstairs;
}

/*
 * Custom callbacks
 */
Collection.when = function(callbackName, callback){
  this.callbacks[callbackName] = callback;
}

Collection.runModelCallbacks = function(modelCallbacks, data, cb){
  var record = this;

  var caller = function(modelCallbackName, _cb){
    record.callbacks[modelCallbackName](data, _cb);
  }

  async.forEach(modelCallbacks, caller, function(err){
    return cb(err, data);
  });
}

/*
 * Eventing
 */

Collection.on = function(eventName, whenFunction){
  this.prototype.on(eventName, whenFunction);
}

Collection.emitQueryEvents = function(queryEvents, data){
  var record = this;

  var eventEmitter = function(eventName){
    record.prototype.emit(eventName, data);
  }

  async.forEach(queryEvents, eventEmitter);
}

/*
 * SQL specific CRUD behaviours.
 */

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

var parseConditions = function (conditions, self, sqlBaseQuery) {
  if (conditions){
    var sqlConditions = jsonConditionsToSQL(self, conditions);
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

Collection.getConnection = function(){
  if (!this.connection.connectionString) {
    this.connection.connectionString = this.Downstairs.connectionString;
  }

  return this.connection;
}

select = function(model, conditions, cb){
  var sqlBaseQuery = model.sql.select(model.sql.star()).from(model.sql);

  sqlBaseQuery = parseConditions(conditions, model, sqlBaseQuery);
  var sqlStr = sqlBaseQuery.toQuery();

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

  model.getConnection().query(sqlStr, cb);
}

Collection.findAll = function(conditions, cb){
  var modelCallbacks, queryEvents;

  if (typeof conditions === 'function') {
    cb = conditions;
  }

  if (conditions) {
    modelCallbacks = conditions.callbacks;
    delete conditions.callbacks;

    queryEvents = conditions.emit;
    delete conditions.emit;
  }

  var self = this;
  select(this, conditions, function(err, results){
    var records = [];

    if (results){
      for (var i in results.rows){
        var record = new self(results.rows[i]);
        records.push(record);
      }
    }

    endQuery(self, queryEvents, modelCallbacks, records, cb, err);
  });
};

Collection.find = function(conditions, cb){
  var modelCallbacks = conditions.callbacks;
  delete conditions.callbacks;

  var queryEvents = conditions.emit;
  delete conditions.emit;

  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  var self = this;

  select(this, conditions, function(err, results){
    var record;
    if (results.rows[0]){
      record = new self(results.rows[0]);
      endQuery(self, queryEvents, modelCallbacks, record, cb, err);
    }
    else {
      cb(err, record);
    }
  });
};

var endQuery = function(model, queryEvents, modelCallbacks, data, cb, err){
  if (err){
    return cb(err, null);
  }

  if (queryEvents){
    model.emitQueryEvents(queryEvents, data);
  }

  if (modelCallbacks){
    model.runModelCallbacks(modelCallbacks, data, cb);
  }
  else {
    cb(null, data);
  }
}

Collection.count = function(conditions, cb){
  var results = [];

  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  var sqlBaseQuery = this.sql.select('COUNT(*)').from(this.sql);
  sqlBaseQuery = parseConditions(conditions, this, sqlBaseQuery);
  var sqlStr = sqlBaseQuery.toQuery();

  if (!this.connection.connectionString) {
    this.connection.connectionString = this.Downstairs.connectionString;
  }

  this.connection.query(sqlStr, function(err, results){
    if (results && results.rows && results.rows[0]) {
      cb(err, results.rows[0].count);
    }
    else {
      cb(err, 0);
    }
  });
};

Collection.update = function(data, conditions, cb){
  data = cleanData(this.sql, data);


  var sqlBaseQuery = this.sql.update(data);

  sqlBaseQuery = parseConditions(conditions, this, sqlBaseQuery);

  var sqlStr = sqlBaseQuery.toQuery();  
  sqlStr.text = sqlStr.text + " RETURNING id;"

  var self = this;
  this.connection.query(sqlStr, function(err, results){
    if (results && results.rowCount > 0) {
      return self.find({id: results.rows[0].id}, cb);
    }

    cb(err, null);
  });
}

Collection.create = function(data, cb){
  if (typeof data === 'function') {
    cb = data;
    data = null;
  }

  data = cleanData(this.sql, data);
  var sqlBaseQuery = this.sql.insert(data);

  var sqlStr = sqlBaseQuery.toQuery();
  sqlStr.text = sqlStr.text + " RETURNING id;"
  var queries = {};
  var self = this;

  this.connection.query(sqlStr, function(err, result){
    if (err){ return cb(err, result) };

    if (result && result.rowCount > 0) {
      return self.find({id: result.rows[0].id}, cb);
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

  var sqlBaseQuery = this.sql.delete(data);
  var sqlStr = sqlBaseQuery.toQuery();

  this.getConnection().query(sqlStr, function(err, results) {
    var result = false;
    if (!err) {
      result = true;
    }

    cb(err, result);
  });
}


/*
 * Associations.
 */

Collection.belongsTo = function(model){
  var belongsToAssociationName = model._name.toLowerCase();
  var foreignKeyName = belongsToAssociationName + "_id"; //oneday this will be configurable

  var belongsTo = function(cb){ 
    var record = this;
    model.find({id: this[foreignKeyName]}, function(err, belonger){
      record[belongsToAssociationName] = belonger;
      cb(err, belonger);      
    }); 
  };

  this.prototype['_' + belongsToAssociationName] = belongsTo;
  this.prototype[belongsToAssociationName] = null;
}

Collection.hasOne = function(model){
  var keyName = this._name.toLowerCase();
  var hasOneAssociationName = model._name; 
  hasOneAssociationName = hasOneAssociationName.toLowerCase();
  var foreignKeyName =  keyName + "_id"; //oneday this will be configurable

  var hasOne = function(cb){ 
    var record = this;
    model.find({id: this[foreignKeyName]}, function(err, one){
      record[hasOneAssociationName] = one;
      cb(err, one);
    }); 
  };

  this.prototype['_' + hasOneAssociationName] = hasOne;
  this.prototype[hasOneAssociationName] = null;
}

Collection.hasMany = function(model){
  var keyName = this._name.toLowerCase();
  var hasManyAssociationName = lingo.en.pluralize(model._name); 
  hasManyAssociationName = hasManyAssociationName.toLowerCase();
  var foreignKeyName =  keyName + "_id"; //oneday this will be configurable

  var hasMany = function(cb){ 
    var record = this;
    model.findAll({id: this[foreignKeyName]}, function(err, all){
      record[hasManyAssociationName] = all;
      cb(err, all);
    }); 
  };

  this.prototype['_' + hasManyAssociationName] = hasMany;
  this.prototype[hasManyAssociationName] = [];
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

  /*
   * Model constructor function. Holds all behaviour for the Collection
   * that must apply to each Record belonging to it (validation, etc.)
   */
  var Model = function(properties){
    this.properties = properties;
    var validationCycle = [];
    var record = this;

    for (var prop in properties){
      this[prop] = this.properties[prop];
    }

    for (var validation in this.validations){
      this[validation] = this.validations[validation];
      var self = this;
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

    this.get = function(associationName, cb){
      return this['_' + associationName](cb);
    }
  };

  Model._name =  name;

  Model.prototype = new Record();
  Model.prototype.constructor = Record;

  Model.connection = dbConnection;
  Model.sql = sql;
  Model.Downstairs = Collection.Downstairs;
  Model.prototype.validations = validations;
  Model.prototype._model = Model;
  Model.callbacks = {};

  mixinCollectionFunctions(Model);

  if (!dbConnection){
    throw new Error('There is no connection defined. Make sure you have called Downstairs.add(connection)');
  }
  else {
    dbConnection.register(name, Model);
  }
  return Model;
}

module.exports = Collection;