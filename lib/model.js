var async = require('async')
  , _ = require('underscore');

var Model = function(properties){
  this._isNew = true;
  this._isDirty = false;


  if (this.id) { this._isNew = false; }

  // this.destroy = function(cb) {}

  // this.save = function(cb) {}

  //an interim step for reaching a JSON representation of the model
  this.toJson = function(options) {
    var returnJson = this.properties;
    return returnJson;
  }

};

module.exports = Model;