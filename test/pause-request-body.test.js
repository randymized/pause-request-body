
'use strict';

require( 'should' );
var pause_request_body = require( '../lib/pause-request-body.js' );

describe( 'pause-request-body', function() {
  describe( 'pause_request_body()', function() {
    it( 'should be a function', function() {
      pause_request_body.should.be.a( 'function' );
    } );
    it( 'should return a pauser function', function() {
      pause_request_body().pauser.should.be.a( 'function' );
    } );
    it( 'should return a resumer function', function() {
      pause_request_body().resumer.should.be.a( 'function' );
    } );
  } );
} );

