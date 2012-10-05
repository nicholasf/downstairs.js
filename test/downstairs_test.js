var Downstairs = require('../lib/downstairs.js')
  , should = require('should')
  , env = require('./../config/env')
  , helper = require('./helper');


describe('Downstairs', function(){

  describe('storing connections', function(){
    it('stores a default connection', function(){
      var dummyConnection = {};
      Downstairs.add(dummyConnection);
      Downstairs.get('default').should.equal(dummyConnection);
    });

    it('stores a named connection', function(){      
      var dummyConnection = {};
      Downstairs.add(dummyConnection, 'primaryDb');
      Downstairs.get('primaryDb').should.equal(dummyConnection);
    })

    it('stores a named connection *and* a default connection', function(){      
      var dummyConnection = {id: 1};
      var dummyConnection2 = {id: 2};
      Downstairs.add(dummyConnection, 'primaryDb');
      Downstairs.add(dummyConnection2);
      Downstairs.get('primaryDb').should.equal(dummyConnection);
      Downstairs.get('default').should.equal(dummyConnection2);
    })

  });
});
