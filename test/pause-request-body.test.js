
'use strict';

require('should');
var connect = require('connect'),
    timers = require('timers'),
    crypto = require('crypto'),
    request = require('request'),
    Stream = require('stream'),
    es = require('event-stream'),
    pause_request_body = require('..');

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

function hash_comparing_sink(get_other_hash,done) {
  return sink(function (result) {
    get_other_hash().digest('hex').should.equal(result);
    done();
  });
}

function hashing_stream() {
  var hash = crypto.createHash('sha1');
  var s= es.map(function (data, callback) {
    hash.update(data)
    callback(null, data)
  })
  s.get_hash= function() {
    return hash;
  }
  return s
}

function receive_and_test(source,done) {
  var hstream = hashing_stream()
  es.pipeline(
    source,
    hstream,
    hash_comparing_sink(hstream.get_hash,done)
  )
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
      receive_and_test(request.get('http://nodejs.org/dist/v0.10.8/node.lib'),done)
    } );
    it( 'should receive a tiny amount of data without loss', function(done) {
      var source = es.readable(function (count, callback) {
        this.emit('a')
        this.emit('end')
        callback()
      })
      receive_and_test(source,done)
    } );
  } );
} );

