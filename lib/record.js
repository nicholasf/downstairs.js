var async = require('async')
  , events = require('events')
  , util = require('util')
  , _ = require('underscore');

var fieldsFinder = function(keys, record){
  var data = {};
  _.each(keys, function(key){
    if (key !== 'id'){
      data[key] = record[key];
    }
  })

  return data;
}

/*
 * Record constructor function. Holds data state mapping 
 * to the abstracted representation of one member of a Collection 
 * e.g. a row in a sql table, a document in a mongo collection, etc..
 */
var Record = function(properties){
  this._isNew = true;
  this._isDirty = false;

  if (this.id) { this._isNew = false; }

  this.destroy = function(cb) {
    var data = fieldsFinder(_.keys(this.properties), this);
    this._model.delete({id: this.id}, cb);      
  }

  this.save = function(cb){
    var data = fieldsFinder(_.keys(this.properties), this);

    var _model = this._model;
    var self = this;

    this.isValid(function(err, result){
      if (err) return cb(err);

      if (!self.id) {
        self._model.create(data, cb);
      }
      else {
        self._model.update(data, {id: self.id}, cb);
      }
    });
  }

  //an interim step for reaching a JSON representation of the model
  this.toJson = function(options) {
    var returnJson = this.properties;
    return returnJson;
  }
};

/* 
 * Records are event emitters
 */
Record.prototype = new events.EventEmitter();

module.exports = Record;