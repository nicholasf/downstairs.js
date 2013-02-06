var Adapter = function(){}
  , sql = require('sql')
  , async = require('async')
  , _ = require('underscore');

/**
 ** SQL specific CRUD behaviours.
 **/
Adapter.prototype.findAll = function(conditions, cb){
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

Adapter.prototype.find = function(conditions, cb){
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

Adapter.prototype.count = function(conditions, cb){
  var results = [];

  if (typeof conditions === 'function') {
    cb = conditions;
    conditions = null;
  }

  var sqlBaseQuery = this.schema.select('COUNT(*)').from(this.schema);
  sqlBaseQuery = parseConditions(conditions, this, sqlBaseQuery);
  var sqlStr = sqlBaseQuery.toQuery();

  this.getConnection().query(sqlStr, function(err, results){
    if (results && results.rows && results.rows[0]) {
      cb(err, results.rows[0].count);
    }
    else {
      cb(err, 0);
    }
  });
};

Adapter.prototype.max = function(conditions, cb){
  var results = [];

  var sqlBaseQuery = this.schema.select('MAX(' + conditions.max + ')').from(this.schema);
  sqlBaseQuery = parseConditions(conditions, this, sqlBaseQuery);
  var sqlStr = sqlBaseQuery.toQuery();

  this.getConnection().query(sqlStr, function(err, results){
    if (results && results.rows && results.rows[0]) {
      cb(err, results.rows[0].max);
    }
    else {
      cb(err, 0);
    }
  });
};

Adapter.prototype.update = function(data, conditions, cb){
  data = cleanData(this.schema, data);


  var sqlBaseQuery = this.schema.update(data);

  sqlBaseQuery = parseConditions(conditions, this, sqlBaseQuery);

  var sqlStr = sqlBaseQuery.toQuery();
  sqlStr.text = sqlStr.text + " RETURNING id;"

  var self = this;
  this.getConnection().query(sqlStr, function(err, results){
    if (results && results.rowCount > 0) {
      return self.find({id: results.rows[0].id}, cb);
    }

    cb(err, null);
  });
}

Adapter.prototype.create = function(data, cb){
  if (typeof data === 'function') {
    cb = data;
    data = null;
  }

  data = cleanData(this.schema, data);
  var sqlBaseQuery = this.schema.insert(data);

  var sqlStr = sqlBaseQuery.toQuery();
  sqlStr.text = sqlStr.text + " RETURNING id;"
  var queries = {};
  var self = this;

  this.getConnection().query(sqlStr, function(err, result){
    if (err){ return cb(err, result) };

    if (result && result.rowCount > 0) {
      return self.find({id: result.rows[0].id}, cb);
    }
    else {
      cb(err, result);
    }
  });
}

Adapter.prototype.delete = function(data, cb) {
  if (typeof data === 'function') {
    cb = data;
    data = null;
  }

  var sqlBaseQuery = this.schema.delete(data);
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
 *  Called to finish a query lifecycle - currently only by find and findAll.
 */
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

var jsonConditionsToSQL = function(Model, conditions){
  var clauses = [];
  for (var key in conditions){
    if (Model.sql[key]) {
      if (typeof conditions[key] === 'undefined' || conditions[key] == null) {
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

select = function(model, conditions, cb){
  var sqlBaseQuery = model.schema.select(model.schema.star()).from(model.schema);

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

var jsonConditionsToSQL = function(Model, conditions){
  var clauses = [];
  for (var key in conditions){
    if (Model.schema[key]) {
      if (typeof conditions[key] === 'undefined' || conditions[key] == null) {
        var clause = Model.schema[key].isNull();
        clauses.push(clause);
      }
      else if (conditions[key]) {
        var clause = Model.schema[key].equals(conditions[key]);
        clauses.push(clause);
      }
    }
    else if (key === 'like') {
      for (var likeKey in conditions[key]){
        var value = conditions[key][likeKey];
        var clause = Model.schema[likeKey].like(value);
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

module.exports = Adapter;
