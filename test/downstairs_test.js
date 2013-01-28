var Downstairs = require('../lib/downstairs.js')
  , should = require('should')
  , env = require('./../config/env')
  , helper = require('./helper');


describe('Downstairs', function(){

  afterEach(function() {
    Downstairs.clear();
  });

  describe('configuring connections & adapters', function(){
    it('mandates that an adapter be passed through', function(){
      var dummyConnection = {url: 1};
      (function(){
        Downstairs.configure(dummyConnection)
      }).should.throw();
    });

    it('stores a default connection', function(){
      var dummyConnection = {url: 1};
      var dummyAdapter = {};
      Downstairs.configure(dummyConnection, dummyAdapter);
      Downstairs.get('default').connection.url.should.equal(dummyConnection.url);
    });

    it('stores a named connection', function(){      
      var dummyConnection = {url: 1};
      var dummyAdapter = {}
      Downstairs.configure(dummyConnection, dummyAdapter, 'primaryDb');
      Downstairs.get('primaryDb').connection.url.should.equal(dummyConnection.url);
    });

    it('stores a named connection *and* a default connection', function(){      
      var dummyConnection = {url: 2};
      var dummyConnection2 = {url: 3};
      var dummyAdapter = {}
      Downstairs.configure(dummyConnection, dummyAdapter, 'primaryDb');
      Downstairs.configure(dummyConnection2, dummyAdapter);
      Downstairs.get('primaryDb').connection.url.should.equal(dummyConnection.url);
      Downstairs.get('default').connection.url.should.equal(dummyConnection2.url);
    });

    it('does not store a connection which is null', function() {
      (function(){
        Downstairs.configure(null);
      }).should.throw();
    
      should.not.exist(Downstairs.get('default'));
    });

    it('fetches a default connection without a name', function() {
      var dummyConnection = {url: 5};
      var dummyAdapter = {}
      Downstairs.configure(dummyConnection, dummyAdapter);
      Downstairs.get().connection.url.should.equal(dummyConnection.url);
    });
  });
});
