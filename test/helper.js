var pg = require('pg')
  , env = require('./../config/env')
  , ectypes = require('ectypes')
  , faker2 = require('faker2')
  , PGStrategy = require('ectypes-postgres')
  , ctx = ectypes.createContext();

var strategy = new PGStrategy(env.connectionString);
ctx.load(strategy);

var blueprint =
  {User: { 
    email: function(){ faker2.Internet.email()} 
    , password: function(){ "5f4dcc3b5aa765d61d8327deb882cf99"}
    , username: function(){ faker2.Internet.userName()}
    , 
  }
}

ctx.add(blueprint);

exports.ectypes = ctx;

exports.resetDb = function(tableSql, done){
  pg.connect(env.connectionString, function(err, client) {
    var resetString = "drop schema public cascade; create schema public;" + tableSql;
    client.query(resetString, function(err, result){
      done()
    });
  });
}

