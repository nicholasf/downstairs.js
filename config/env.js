var connectionString, db, env, envConf, fs, k, nconf, overridingConfig, pg, v;

fs = require('fs');

nconf = require('nconf');

pg = require('pg');

nconf.argv().env().file({
  file: 'config/defaults.json'
});

overridingConfig = nconf.get('defaults');

if (overridingConfig != null) {
  nconf.file(overridingConfig);
  console.log('Found a config file to override anything in config/default.json');
}

env = process.env.NODE_ENV || 'development';

envConf = nconf.get(env);

db = envConf.database;

if (!db) {
  throw Error('The database config is undefined in environment ' + env + '. Check your config.');
}

connectionString = "postgres://" + db.user + ":" + db.password + "@" + db.host + ":" + db.port + "/" + db.name;

exports.connectionString = connectionString;

for (k in envConf) {
  v = envConf[k];
  exports[k] = v;
}

exports.config = env;
