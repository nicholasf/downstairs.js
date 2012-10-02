var pg = require('pg')
  , env = require('./../config/env')
  , ectypes = require('ectypes')
  , faker2 = require('faker2')
  , PGStrategy = require('ectypes-postgres')
  , sql = require('sql')
  , ctx = ectypes.createContext();

var strategy = new PGStrategy(env.connectionString);
ctx.load(strategy);

var blueprint =
  {User: { 
    email: function(){ return faker2.Internet.email()} 
    , password: function(){ return "5f4dcc3b5aa765d61d8327deb882cf99"}
    , username: function(){ return faker2.Internet.userName()}
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

exports.userSQL = sql.Table.define({
      name: 'users'
      , quote: true
      , columns: ['id' 
        , 'username' 
        , 'created_at'
        , 'updated_at'
        , 'is_active'
        , 'email'
        , 'password'
      ]
    });

exports.userTableSQL = "CREATE TABLE users\
(\
  id bigserial NOT NULL,\
  username character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  email character varying(512) unique,\
  password character varying(512),  \
  CONSTRAINT pk_users PRIMARY KEY (id)\
);"
