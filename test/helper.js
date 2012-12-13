var pg = require('pg')
  , env = require('./../config/env')
  , ectypes = require('ectypes')
  , faker2 = require('faker2')
  , PGStrategy = require('ectypes-postgres')
  , sql = require('sql')
  , ctx = ectypes.createContext()
  , Downstairs = require('./../lib/downstairs')
  , Connection = Downstairs.Connection;

pg.defaults.poolSize = 50;

exports.ectypes = require('./blueprints');

exports.resetDb = function(tableSql, done){
  pg.connect(env.connectionString, function(err, client) {
    var resetString = "drop schema public cascade; create schema public;" + tableSql;
    client.query(resetString, function(err, result){
      done()
    });
  });
}

//common sql configurations used across tests
exports.userConfig = sql.Table.define({
  name: 'users'
  , quote: true
  , schema: 'public'
  , columns: ['id'
    , 'username'
    , 'created_at'
    , 'updated_at'
    , 'email'
    , 'password'
    , 'role_id'
  ]
});

exports.accountConfig = sql.Table.define({
  name: 'accounts'
  , quote: true
  , columns: ['id'
    , 'user_id'
    , 'balance'
  ]
});

exports.roleConfig = sql.Table.define({
  name: 'roles'
  , quote: true
  , columns: ['id'
    , 'name'
  ]
});

exports.repeatableConfig = sql.Table.define({
  name: 'repeatables'
  , quote: true
  , schema: 'public'
  , columns: ['id'
   , 'name']
});

exports.longerTableNameConfig = sql.Table.define({
  name: 'longer_table_names'
  , quote: true
  , schema: 'public'
  , columns: ['id'
   , 'name'
   , 'user_id']
});


exports.userSQL = "CREATE TABLE users\
(\
  id serial NOT NULL,\
  username character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  email character varying(512) unique,\
  password character varying(512),  \
  role_id integer, \
  CONSTRAINT pk_users PRIMARY KEY (id)\
);"

exports.accountSQL = "CREATE TABLE accounts\
(\
  id serial NOT NULL,\
  user_id integer,\
  balance integer,\
  name character varying(100)\
);"

exports.roleSQL = "CREATE TABLE roles\
(\
  id serial NOT NULL,\
  name character varying(100)\
);"

exports.repeatableSQL = "CREATE TABLE repeatables\
(\
  id serial NOT NULL,\
  name character varying(100)\
);"

exports.longerTableNameSQL = "create table longer_table_names\
(\
  id serial NOT NULL,\
  name character varying(100),\
  user_id integer \
);"

var defaultConnection = new Connection.PostgreSQL(env.connectionString);
exports.defaultConnection = defaultConnection;


