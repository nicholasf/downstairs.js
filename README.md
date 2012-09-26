# downstairs
This project is in alpha/beta status. We are building out functionality as we need it (at a rapid pace). See below for the API and for what has been currently built.

A lightweight ORM set around brianc's work on node-sql and node-postgres, see https://github.com/brianc/node-sql and https://github.com/brianc/node-postgres.

Documentation will appear in due course. For now, see the tests. We advise *against* using it for the moment, as we will be adding behaviours on a daily basis (we needed an ORM!). 

## API

### Table level calls
```
var Downstairs = require('../lib/downstairs.js').Downstairs;
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

var User =Table.register(userSQL);

User.find(conditions, cb);
User.findAll(conditions, cb);
User.insert(data, cb);
User.delete(conditions, cb); // TODO
User.update(data, conditions, cb);
```

#### Table.find(conditions, cb)

This returns a single User model based on the conditions (where clause) passed in.
The conditions are a node-sql where clause constructed by functions on the sql object.
The conditions is an optional parameter. The following calls are valid (the last two
are equivalent:

```
var User = Table.register(userSQL);

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
var User = Table.register(userSQL);

User.findAllAll(User.sql.email.equals('someone@moneytribe.com.au'), function(err, users) {
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

#### Table.insert(data, cb);

This inserts a user into the underlying table, You must provide data. This returns true
or false depending on whether the operation worked or not (it probably should return the
primary key instead).

```
User.insert({email: 'someone@moneytribe.com.au', username: 'someone'}, function(err, users) {
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
var User = Table.register(userSQL);

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
