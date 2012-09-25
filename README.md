# downstairs
This project is in alpha/beta status. We are building out functionality as we need it (at a rapid pace). See below for the API and for what has been currently.

A lightweight ORM build around brianc's work on node-sql and node-postgres, see https://github.com/brianc/node-sql and https://github.com/brianc/node-postgres.

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

User.find(conditions, cb); //done
User.findAll(conditions, cb); //done
User.create(data, cb);
User.delete(data, cb);
User.update(data, cb);
```

### Model instance calls

```
var user = new User({username: 'someone2'}); //done

user.save(cb);
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
