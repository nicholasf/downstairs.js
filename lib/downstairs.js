Table = {};
Table.registry = {};

/*
 * mixin behaviours for all models go here
 */
Table.find = function(){};

/*
 *
 */
Table.register = function(key, mappings){
  Table.registry.key = mappings;

  Model = function(properties){}

  Model.mappings = mappings;

  return Model;
}


/*
 * user = new User({email: 'nicholas.faiz@gmail.com'})
 *
 */