var Downstairs = {};
var Table = {};
Table.registry = {};
var pg = require('pg');

Downstairs.go = function(connectionstring){
  Downstairs.conn = connectionstring;
} 

Downstairs.query = function(query, cb) {
  pg.connect(Downstairs.conn, function(err, client) {
    client.query(query, function(err, result) {
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

  var sqlStr = this.sql.select(this.sql.star()).from(this.sql).toQuery();
  var _self = this;

  var finderAllCb = function(err, results){
    var models = [];
    for (var i in results.rows){
      var model = new _self(results.rows[i]);
      models.push(model);
      cb(err, models);
    }
  }  

  this.Downstairs.query(sqlStr, finderAllCb);
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
  }
  Model.sql = sql;
  Model.Downstairs = Downstairs;
  this.isNew = true;
  this.isDirty = false;

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