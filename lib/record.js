var async = require('async')
  , _ = require('underscore');


var fieldsFinder = function(keys, record){
  var data = {};
  // var keys = _.keys(this.properties);
  _.each(keys, function(key){
    if (key !== 'id'){
      data[key] = record[key];
    }
  })

  return data;
}

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
    this._model.update(data, {id: this.id}, cb);  
  }

  //an interim step for reaching a JSON representation of the model
  this.toJson = function(options) {
    var returnJson = this.properties;
    return returnJson;
  }
};

module.exports = Record;