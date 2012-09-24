Table = {};
Table.registry = {};

/*
 * mixin behaviours for all models go here
 */
Table.find = function(){};

/*
 *
 */
Table.register = function(sql){
  Table.registry[sql.name] = sql;

  var Model = function(properties){}

  Model.sql = sql;

  return Model;
}


/*
 * user = new User({email: 'nicholas.faiz@gmail.com'})
 *
 */