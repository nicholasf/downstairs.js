var Downstairs = require('../lib/downstairs.js').Downstairs
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , Table = require('../lib/downstairs.js').Table;

var mouseSQL = sql.Table.define({
      name: 'mice'
      , quote: true
      , columns: ['id' 
        , 'mousename' 
        , 'created_at'
        , 'updated_at'
      ]
    });

var config = {};
config.sql = mouseSQL;
config.associations = [{'hasMany': 'cats'}];

var Mouse = Table.model(config);

  var mouseTableSQL = "CREATE TABLE mice\
(\
  id bigserial NOT NULL,\
  micename character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  CONSTRAINT pk_users PRIMARY KEY (id)\
);"

var catSQL = sql.Table.define({
      name: 'cats'
      , quote: true
      , columns: ['id' 
        , 'catname' 
        , 'created_at'
        , 'updated_at'
      ]
    });

  var catTableSQL = "CREATE TABLE cats\
(\
  id bigserial NOT NULL,\
  micename character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  CONSTRAINT pk_users PRIMARY KEY (id)\
);"


//need to test ...
//1. hasOne and belongsTo
//2. hasMany and belongsTo