// var Adapter = function(){}
//   , redis = require('redis')
//   , async = require('async')
//   , _ = require('underscore');

// /**
//  ** SQL specific CRUD behaviours.
//  **/
// Adapter.prototype.findAll = function(conditions, cb){
//   var modelCallbacks, queryEvents;

//   if (typeof conditions === 'function') {
//     cb = conditions;
//   }

//   if (conditions) {
//     modelCallbacks = conditions.callbacks;
//     delete conditions.callbacks;

//     queryEvents = conditions.emit;
//     delete conditions.emit;
//   }

//   cb();
// };

// Adapter.prototype.find = function(conditions, cb){
//   var modelCallbacks = conditions.callbacks;
//   delete conditions.callbacks;

//   var queryEvents = conditions.emit;
//   delete conditions.emit;

//   if (typeof conditions === 'function') {
//     cb = conditions;
//     conditions = null;
//   }
//   cb()
// };


// Adapter.prototype.update = function(data, conditions, cb){
//   data = cleanData(this.sql, data);

//   cb();
// }

// Adapter.prototype.create = function(data, cb){
//   if (typeof data === 'function') {
//     cb = data;
//     data = null;
//   }

//   cb();
// }

// Adapter.prototype.delete = function(data, cb) {
//   if (typeof data === 'function') {
//     cb = data;
//     data = null;
//   }

//   cb();
// }

// Adapter.prototype.count = function(conditions, cb){
//   var results = [];

//   if (typeof conditions === 'function') {
//     cb = conditions;
//     conditions = null;
//   }

//   cb();
// };


// module.exports = Adapter;