[![Build Status](https://secure.travis-ci.org/moneytribeaustralia/downstairs.js.png)](http://travis-ci.org/moneytribeaustralia/downstairs.js)

Documentation currently a work in progress. 

# downstairs

A Node.js ORM Framework with 

  * adapters (one ships with brianc's node-sql, or write your own over your favourite database and take advantage of the Downstairs framework)
  * associations - belongsTo, hasOne, hasMany
  * validations
  * 'named callbacks' - like middleware at the model layer, helpful to reduce nesting in your model logic.
  * events - define an event lifecycle on a Model.
  * an ectypes testing library allowing the easy creation of test objects - ectypes-downstairs

Downstairs is in production use for three Moneytribe codebases.

## Roadmap

Currently in development:

* eager loading of associations via dynamic left outer joins
* improved validation objects for easy form integration
* formal description of when to use the simple JSON query abstraction language or to drop into a dialect specific query 


## Overview

Downstairs has 'Collections' and 'Records'. A **Collection** is a group of documents. A **Record** is a single document.

Configure Downstairs with as many database connections and adapters as needed:

``` javascript
var pgConnection = new Downstairs.Connection.PostgreSQL(env.connectionString);
var sqlAdapter = new SQLAdapter();
Downstairs.add(pgConnection, sqlAdapter, "primarydb");
```

Assign a Collection to a configuration:

``` javascript
var sql = require('sql')
  , Validator = require('validator').Validator;


var userConfig = sql.Table.define({
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

var validations = {
  passwordPresent: function(cb){
      var validator =  new Validator();
      try{
        validator.check(this.password).notNull();
        cb(null, null);
      }
      catch(e){
        cb(null, "Password: " + e.message);
      }
    }
};

var User = Collection.model('User', userConfig, validations, 'primarydb');
```

## API

### Migrations

For migrations use VisionMedia's node-migrate: https://github.com/visionmedia/node-migrate .

This means you will have to hand craft your SQL to create tables but this is a *good* thing.

For example, we have a migrations directory and a migrations helper to expedite things. We also export the migration so it can be called upon in tests (when we want to rapidly construct tables after tearing down the database).

``` coffeescript
# Copyright (c) 2012 MoneyTribe
migrator = require './helper'

upStatement = "CREATE TABLE users
(
  id bigserial NOT NULL,
  username character varying(100) UNIQUE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true,
  email character varying(512) UNIQUE,
  password character varying(64),
  CONSTRAINT pk_users PRIMARY KEY (id)
  WITH (FILLFACTOR=90)
)
WITH (
  OIDS=FALSE
);"

downStatement = "DROP TABLE users;";

exports.up = (next) ->
  migrator.run upStatement, (err, result) ->
    next() if result
    throw err if err

exports.down = (next)->
  migrator.run downStatement, (err, result) ->
    next() if result
    throw err if err

exports.upStatement = upStatement
```

## Getting Started

Install the module with: `npm install downstairs`

``` javascript
var downstairs = require('downstairs');
```

## Contributors

  * @nicholasf
  * @kristian-puccio
  * @damienwhaley

## License
Copyright (c) 2012 Moneytribe Pty Ltd.
Licensed under the MIT license.
