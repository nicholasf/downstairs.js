var Connection = function(connectionString) {
  this.connectionString = connectionString;
  this.modelConstructorRegistry = {};
};

// model registry
Connection.prototype.register = function(modelName, Model) {
  this.modelConstructorRegistry[modelName] = Model;
};

module.exports = Connection;