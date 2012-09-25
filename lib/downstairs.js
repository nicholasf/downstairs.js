var Downstairs = {};
var Table = {};
Table.registry = {};
var pg = require('pg');

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

/*
 * The register function creates a Model constructor function
 * & copies all Table level behaviours onto the Model
 * & copies the node-sql object onto the Model.
 */
Table.register = function(sql){
  Table.registry[sql.name] = sql;
  var Model = function(properties){
    this.properties = properties;
    this._isNew = true;
    this._isDirty = false;

    for (var prop in properties){
      this[prop] = properties[prop];
    }

    if (this.id) { this._isNew = false; }
  }

  Model.sql = sql;
  Model.Downstairs = Downstairs;

  for (var property in Table){
    if (property === "register"){ continue }

    if (typeof Table[property] === 'function'){
      Model[property] = Table[property];
    }
  }

  return Model;
}


exports.Table = Table;
exports.Downstairs = Downstairs;
/*
 * user = new User({email: 'nicholas.faiz@gmail.com'})
 *
 */