var pg = require('pg')
  , env = require('./../config/env')
  , ectypes = require('ectypes')
  , faker2 = require('faker2')
  , PGStrategy = require('ectypes-postgres')
  , sql = require('sql')
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

ctx.add(userBlueprint);

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
      , schema: 'public'
      , columns: ['id' 
        , 'username' 
        , 'created_at'
        , 'updated_at'
        , 'email'
        , 'null_field'
        , 'password'
      ]
    });

exports.userTableSQL = "CREATE TABLE users\
(\
  id serial NOT NULL,\
  username character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  email character varying(512) unique,\
  null_field character varying(50),\
  password character varying(512),  \
  CONSTRAINT pk_users PRIMARY KEY (id)\
);"

exports.repeatableTableSQL = "CREATE TABLE repeatables\
(\
  id serial NOT NULL,\
  name character varying(100)\
);"

var defaultConnection = new Connection.PostgreSQL(env.connectionString);
exports.defaultConnection = defaultConnection;


