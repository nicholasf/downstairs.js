Table = {};
Table.registry = {};

/*
 * mixin behaviours for all models go here
 */
Table.findAll = function(conditions, cb){
  var results = [];
  var sqlStr = this.sql.select().from(sql);
  cb(null, sqlStr);
};

/*
 * The register function creates a Model constructor function
 * & copies all Table level behaviours onto the Model
 * & copies the node-sql object onto the Model.
 */
Table.register = function(sql){
  Table.registry[sql.name] = sql;
  var Model = function(properties){}
  Model.sql = sql;

  for (var property in Table){
    if (property === "register"){ continue }

    if (typeof Table[property] === 'function'){
      Model[property] = property;
    }
  }

  return Model;
}


/*
 * user = new User({email: 'nicholas.faiz@gmail.com'})
 *
 */