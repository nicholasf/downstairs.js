var Downstairs = require('../lib/downstairs.js')
  , should = require('should')
  , env = require('./../config/env')
  , helper = require('./helper');


describe('Downstairs', function(){

  beforeEach(function() {
    Downstairs.clear();
  });

  describe('storing connections', function(){
    it('stores a default connection', function(){
      var dummyConnection = {connectionString: 1};
      Downstairs.add(dummyConnection);
      Downstairs.get('default').should.equal(dummyConnection);
    });

    it('stores a named connection', function(){      
      var dummyConnection = {connectionString: 1};
      Downstairs.add(dummyConnection, 'primaryDb');
      Downstairs.get('primaryDb').should.equal(dummyConnection);
    });

    it('stores a named connection *and* a default connection', function(){      
      var dummyConnection = {connectionString: 2};
      var dummyConnection2 = {connectionString: 3};
      Downstairs.add(dummyConnection, 'primaryDb');
      Downstairs.add(dummyConnection2);
      Downstairs.get('primaryDb').should.equal(dummyConnection);
      Downstairs.get('default').should.equal(dummyConnection2);
    });

    it('does not store a connection which is null', function() {
      var dummyConnection = {connectionString: 4};
      try {
        Downstairs.add(null);
      } catch (exception) {
        // Do nothing
      }
      should.not.exist(Downstairs.get('default'));
    });

    it('fetches a default connection without a name', function() {
      var dummyConnection = {connectionString: 5};
      Downstairs.add(dummyConnection);
      Downstairs.get().should.equal(dummyConnection);
    });

  });
});
