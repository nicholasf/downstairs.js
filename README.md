 [![build status](https://secure.travis-ci.org/moneytribeaustralia/downstairs.js.png)](http://travis-ci.org/moneytribeaustralia/downstairs.js)

# downstairs
This project is in alpha/beta status.

A lightweight ORM set around brianc's work on building a SQL dialect library in node-sql (https://github.com/brianc/node-sql). 


We are building a tool that we need immediately, so are focusing initially on postgres compliance. We would like to make the tool friendly to whichever databases node-sql supports. So if you're looking for an ORM for MySQL or sqlite please check out node-sql.

Our ORM implementation seems closest to DataMapper (although we haven't looked into funky things like composing multiple tables into one Model yet). Initial inspiration was from ActiveRecord in Ruby (associations will appear familiar, etc.). 

Documentation will appear in due course. For now, see the tests. We advise *against* using it for the moment, as we will be adding behaviours on a daily basis (we needed an ORM!). 


## Overview

Make a connection:

```
var Downstairs = require('downstairs')
var PGConnection = require('downstairs/connections/postgres')

var pgConnection = new PGConnection('postgres://nicholas:null@localhost:5432/downstairs_test');

Downstairs.go(pgConnection); //pgConnection is now the 'default' database
Downstairs.go(pgConnection, "primary"); //pgConnection is now the 'primary' database

Table.model(schema, validations); //this table will use the default connection
Table.model(schema, validations, "primary"); //this table will use the connection named 'primary'



```


## Development Roadmap

Features which need to be ready quickly for us. 

* **Associations** - eager fetching, lazy loading, and an event to subscribe to which describes when a model's associations are fully loaded. Eager fetching of associations represents a huge win for us (we'll prolly use async.js behind the scenes). So, when you set up your model, you'll define what associations are eagerly loaded, the others will be lazily loaded. And that config should be overridable.

The below will lead us, eventually, to a 1.0.0 release.

* **Eventing lifecycle** (for e.g., so you can listen for whenever a model is altered). Validations will probably be evented too.
* **Proper connection abstraction**. Right now we are just hard coding in node-postgres connections. We should wrap the connection so if someone wants to use mysql or sqlite, they can.
* **Explicit transaction handling**.  


## API

### Table level calls
```
var Downstairs = require('../lib/downstairs.js').Downstairs;
var Table = require('../lib/downstairs.js').Table;
var sql = require('sql');

Downstairs.go('postgres://nicholas:null@localhost:5432/downstairs_test'); 

var userSQL = sql.Table.define({
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

var User = Table.model(userSQL);

User.find(conditions, cb);
User.findAll(conditions, cb);
User.create(data, cb);
User.delete(conditions, cb); // TODO
User.update(data, conditions, cb);
```

#### Table.find(conditions, cb)

This returns a single User model based on the conditions (where clause) passed in.
The conditions are a node-sql where clause constructed by functions on the sql object.
The conditions is an optional parameter. The following calls are valid (the last two
are equivalent:

```
var User = Table.model(userSQL);

User.find(User.sql.email.equals('someone@moneytribe.com.au'), function(err, user) {
  // user is the first user model in the underlying resultset.
  // Do something with it!
});

User.find(function(err, user) {
  // user is the first user model in the underlying resultset.
  // Do something with it!
});

User.find(null, function(err, user) {
  // user is the first user model in the underlying resultset.
  // Do something with it!
});
```

#### Table.findAll(conditions, cb)

This returns an array of User models based on the conditions (where clause) passed in.
The conditions are a node-sql where clause constructed by functions on the sql object.
The conditions is an optional parameter. The following calls are valid (the last two
are equivalent:

```
var User = Table.model(userSQL);

User.findAll(User.sql.email.equals('someone@moneytribe.com.au'), function(err, users) {
  // users is the array of all users from the underlying resultset.
  // Do something with it!
});

User.findAll(function(err, users) {
  // users is the array of all users from the underlying resultset.
  // Do something with it!
});

User.findAll(null, function(err, users) {
  // users is the array of all users from the underlying resultset.
  // Do something with it!
});
```

#### Table.create(data, cb);

This inserts a user into the underlying table, You must provide data. This returns true
or false depending on whether the operation worked or not (it probably should return the
primary key instead).

```
User.create({email: 'someone@moneytribe.com.au', username: 'someone'}, function(err, users) {
  // users is the array of all users from the underlying resultset.
  // Do something with it!
});
```

#### User.delete(conditions, cb);

This is on our to do list!

#### User.update(data, conditions, cb); // done

This updates an existing user's data. The conditions parameter is optional. This returns
true or false depending on whether the operation was successful or not. If you do not pass
conditions then it will update all rows in the table. Be careful! The last two statements
are equivalent.

```
var User = Table.model(userSQL);

User.update({password: 'nottellingyou'}, User.sql.email.equals('someone@moneytribe.com.au'), function(err, result) {
  // result is true if there was 1 or more rows updated.
});

User.update({password: 'nottellingyou'}, null, function(err, result) {
  // result is true if there was 1 or more rows updated.
});

User.update({password: 'nottellingyou'}, function(err, result) {
  // result is true if there was 1 or more rows updated.
});
```

### Model instance calls

```
var user = new User({username: 'someone2'}); //done

user.save(cb); // should do a Table.insert or Table.update depending on _isNewflag
user.validate(cb); //we'll delegate validations to node-validator probably
user.destroy(cb);
```

### Validations

Validations are closures which are passed into the Table registration function but are invoked  on an instance of the model.

Note - you can use *whichever* library you want for validations. The example below uses node-validator (https://github.com/chriso/node-validator). 

Validations are run in parallel using async.js (https://github.com/caolan/async).

```
var userValidation = {
  uniqueUsername: function(cb){
    User.find(this.sql.username.equals(this.username), function(errs, user){
      if (user){
        cb(null, "User already exists with username, id: ", user.id);
      } else {
        cb();
      }
    });
 }
}

var User = Table.model(userSQL, userValidation);
var user = new User({username: 'fred'});

user.isValid(function(errs, result){
  result.should.be.ok;
  done();
});   
 
```

The result will be a boolean indicating successful validation. If the result is false, errs will hold an array of error messages.

### Associations

Downstairs supports hasOne, hasMany and belongsTo. Importantly, it also lets you define whether associations are loaded eagerly or lazily.

```
var Customer = Table.model(userSQL, userValidations);
var Role = Table.model(roleSQL, roleValidations);
var BillingAccount = Table.model(projectSQL, billingAccountValidations);

User.belongsTo(Role, {foreignKey: 'role_id', eager: true});
Role.hasMany(User);
User.hasOne(BillingAccount)
BillingAccount.belongsTo(User, {foreignKey: 'user_id', eager: true});

User.find({id: 1}, function(err, user){
  console.log(user.role.name); //'customer'  
});

Role.find({name: 'customer'}, function(err, role){
  console.log(role.users); //null
  role.getUsers(function(err, users){ 
    console.log(role.users.length); //1
  });  

  //another user is added to the customer role
  role.reload(function(err, role){
    role.users(function(err, users){ 
      console.log(role.users.length); //2
    })
  });
});

Role.find({name: 'customer', eager: ['users']}, function(err, role){
  console.log(role.users.length); //2
});

```
Note - eager loading defaults to false but that it can be switched to true on find statements.Also note that for every association two properties are mapped to the object - the name of the association holding data or null, and a getter function for the association accepting a callback.

### Migrations

For migrations use VisionMedia's node-migrate: https://github.com/visionmedia/node-migrate .

This means you will have to hand craft your SQL to create tables but this is a *good* thing.

For example, we have a migrations directory and a migrations helper to expedite things. We also export the migration so it can be called upon in tests (when we want to rapidly construct tables after tearing down the database).

```
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

```javascript
var downstairs = require('downstairs');
```

## Contributors
* nicholasf
* damienwhaley

## License
Copyright (c) 2012 Moneytribe Pty Ltd.
Licensed under the MIT license.
