# downstairs

A Node.js ORM with 

* adapters (one ships with brianc's node-sql, or write your own over your favourite database and take advantage of the framework)
* associations - belongsTo, hasOne, hasMany
* validations
* 'named callbacks' - hand query results to subsidiary functions to reduce callback nesting
* events - define an event lifecycle on a Model.

Downstairs is in production use for three Moneytribe codebases.


## Overview

Downstairs has 'Collections' and 'Records'. A Collection is a group of documents. A Record is a single document.

Configure Downstairs with as many database connections and adapters as needed:

```
var pgConnection = new Downstairs.Connection.PostgreSQL(env.connectionString);
var sqlAdapter = new SQLAdapter();
Downstairs.add(pgConnection, sqlAdapter, "primarydb");
```

Assign a Collection to a configuration:

```
var User = Collection.model('User', helper.userConfig, 'primarydb');

```



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
