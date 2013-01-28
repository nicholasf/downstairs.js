var Collection = {}
  , Downstairs = require('./downstairs')
  , async = require('async')
  , _ = require('underscore')
  , Record = require('./record')
  , lingo = require('lingo')
  , fleck = require('fleck');

/**
 ** Database behaviours. These functions are copied onto the Model (a constructor function).
 ** Each of these functions applies the adapter function onto the Model.
 **/
mandatedCalls = ['find', 'findAll', 'update', 'create', 'delete', 'count'];

/**
 ** Called after a Model object is created.
 **/
var wireAdapter = function(Model, adapter){
  var wirer = function(name){
    Collection[name] = function(conditions, cb){
      this.configuration.adapter[name].apply(this, arguments);
    }
  }

  mandatedCalls.forEach(wirer);

  /** Wire the remaining functions in the Adapter to the Model **/
  var reminaingAdapterFunctionNames = _.difference(Object.keys(adapter.__proto__), mandatedCalls);
  reminaingAdapterFunctionNames.forEach(wirer);

  for (var property in Collection){
    if (property === "model"){ continue }

    if (typeof Collection[property] === 'function'){
      Model[property] = Collection[property];
    }
  }
}

Collection.getConnection = function(){
  return this.configuration.connection;
}

/**
 ** Named callbacks.
 **/
Collection.when = function(callbackName, callback){
  this.callbacks[callbackName] = callback;
}

Collection.runModelCallbacks = function(modelCallbacks, data, cb){
  var record = this;

  var caller = function(invocation, cb){
    if (typeof invocation === "string"){
      record.callbacks[invocation](data, cb);
    }
    else { //we assume it's an object matching {name: 'callbackName', args: [...]}
      invocation.args.push(cb);
      var func = record.callbacks[invocation.name].bind(null, data);
      func.apply(null, invocation.args);
    }
  }

  async.forEach(modelCallbacks, caller, function(err){
    return cb(err, data);
  });
}

/**
 ** Eventing
 **/

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

/**
 ** Associations.
 **/
Collection.belongsTo = function(model){
  var belongsToAssociationName = fleck.underscore(model._name);
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
  var keyName = fleck.underscore(this._name);
  var hasOneAssociationName = fleck.underscore(model._name);
  var foreignKeyName =  keyName + "_id"; //oneday this will be configurable

  var hasOne = function(cb){
    var record = this;
    var query = {};
    query[foreignKeyName] = record.id;
    model.find(query, function(err, one){
      record[hasOneAssociationName] = one;
      cb(err, one);
    });
  };

  this.prototype['_' + hasOneAssociationName] = hasOne;
  this.prototype[hasOneAssociationName] = null;
}

Collection.hasMany = function(model){
  var keyName = fleck.underscore(this._name);
  keyName = keyName.toLowerCase();
  var hasManyAssociationName = lingo.en.pluralize(fleck.underscore(model._name));
  var foreignKeyName =  keyName + "_id"; //oneday this will be configurable

  var hasMany = function(cb){
    var record = this;
    var query = {};
    query[foreignKeyName] = record.id;
    model.findAll(query, function(err, all){
      record[hasManyAssociationName] = all;
      cb(err, all);
    });
  };

  this.prototype['_' + hasManyAssociationName] = hasMany;
  this.prototype[hasManyAssociationName] = [];
}

var createValidator = function(model, validationName){
  return function(cb){
    model[validationName](cb);
  }
};

/*
 * The model function creates a Model constructor function
 * & copies all Collection (Adapter) level behaviours onto the Model.
 *
 * Database specific languages should be within the schema argument,
 * which is copied onto Model.schema (for use in the adapter).
 */
Collection.model = function model(name, schema, validations, configurationName){
  var configuration;

  if (configurationName){
    configuration = Downstairs.get(configurationName);
  } else {
    configuration = Downstairs.get('default');
    if (!configuration){
      throw Error("Downstairs couldn't identify a configuration for your Collection: "
        + "(Collection name: " + name
        + ", configurationName: " + configurationName + " )"
      );
    }
  }

  console.log("Using ", configurationName, " for ", name, ": ", configuration);

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

  Model.configuration = configuration;
  Model.schema = schema;
  Model.Downstairs = Collection.Downstairs;
  Model.prototype.validations = validations;
  Model.prototype._model = Model;
  Model.callbacks = {};

  wireAdapter(Model, configuration.adapter);

  if (!configuration){
    throw new Error('There is no connection defined. Make sure you have called Downstairs.add(connection)');
  }
  else {
    configuration.register(name, Model);
  }
  return Model;
}

module.exports = Collection;