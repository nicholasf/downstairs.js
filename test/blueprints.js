var env = require('./../config/env')
  , ectypes = require('ectypes')
  , faker2 = require('faker2')
  , PGStrategy = require('ectypes-postgres')
  , ctx = ectypes.createContext()
  , Downstairs = require('./../lib/downstairs')
  , Connection = Downstairs.Connection;

var strategy = new PGStrategy(env.connectionString);
ctx.load(strategy);

var userBlueprint =
  {User: { 
    email: function(){ return faker2.Internet.email()} 
    , password: function(){ return "5f4dcc3b5aa765d61d8327deb882cf99"}
    , username: function(){ return faker2.Internet.userName()}
    , 
  }
}

var accountBlueprint = {
  Account: {
    name: function(){ return faker2.Lorem.words(1).join(''); }
  }
}

var roleBlueprint = {
  Role: {
    name: function(){ return faker2.Lorem.words(1).join(''); }
  }
}

var longerTableNameBlueprint = {
  LongerTableName: {
    name: function(){ return faker2.Lorem.words(1).join(''); }
  }
}

ctx.add(userBlueprint);
ctx.add(accountBlueprint);
ctx.add(roleBlueprint);
ctx.add(longerTableNameBlueprint);

module.exports = ctx;