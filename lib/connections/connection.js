var Connection = function(connectionString) {
  this.connectionString = connectionString;
  this.modelConstructors = {};
};

// model registry
Connection.prototype.register = function(modelName, Model) {
  this.modelConstructors[modelName] = Model;
};

module.exports = Connection;