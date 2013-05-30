
'use strict';

require('should');
var connect = require('connect'),
    timers = require('timers'),
    crypto = require('crypto'),
    http = require('http'),
    fs = require('fs'),
    request = require('request'),
    Stream = require('stream'),
    es = require('event-stream'),
    pause_request_body = require('../lib/pause-request-body.js');

var app= connect()
  .use(pause_request_body.pauser())
  .use(function(req, res, next){
    timers.setTimeout(next, 1000) // add a delay.  Try to lose data!
  })
  .use(pause_request_body.resumer())
  .use(function(req, res, next){
    var receivedHash = crypto.createHash('sha1');
    req.on('data', function(chunk) {
      receivedHash.update(chunk)
    })
    req.on('end', function() {
      res.setHeader('Content-Type','text/plain');
      res.end(receivedHash.digest('hex'));
    })
  })
  .listen(3000);

function sink(cb) {
  var s = new Stream;
  s.writable = true;
  var hash = crypto.createHash('sha1');

  var bytes = 0;

  s.write = function (buf) {
    hash.update(buf)
    return true
  };

  s.end = function (buf) {
    if (arguments.length) s.write(buf);

    s.writable = false;
    cb(hash.digest('hex'))
  };

  s.destroy = function () {
      s.writable = false;
  };
  return s;
}

function hashing_stream() {
  var hash = crypto.createHash('sha1');
  debugger
  var s= es.map(function (data, callback) {
    hash.update(data)
    callback(null, data)
  })
  s.get_hash= function() {
    return hash;
  }
  return s
}

describe( 'pause-request-body', function() {
  describe( 'pause_request_body', function() {
    it( 'should include a pauser function', function() {
      pause_request_body.pauser.should.be.a( 'function' );
    } );
    it( 'should include a resumer function', function() {
      pause_request_body.resumer.should.be.a( 'function' );
    } );
    it( 'should receive a sizable file without loss', function(done) {
      var hstream = hashing_stream()
      var source= request.get('http://nodejs.org/dist/v0.10.8/node.lib')
      source.pipe(hstream).pipe(sink(function (result) {
        hstream.get_hash().digest('hex').should.equal(result)
        done()
      } ));
    } );
    it( 'should receive a tiny amount of data without loss', function(done) {
      var hstream = hashing_stream()
      var source = es.readable(function (count, callback) {
        this.emit('a')
        this.emit('end')
        callback()
      })
      source.pipe(hstream).pipe(sink(function (result) {
        hstream.get_hash().digest('hex').should.equal(result)
        done()
      } ));
    } );
  } );
} );

