var downstairs = require('../lib/downstairs.js')
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , ;

describe('Model, table level behaviours', function(){

  beforeEach(function(done){

    config.query('drop schema public cascade; create schema public;', function(err, result){
      done();
    });
  })

  it('returns a Model (a constructor function), with a mappings property', function(){

  })
})