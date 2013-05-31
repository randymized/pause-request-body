# pause-request-body

Middleware to pause streaming of the request body until a receiver is ready.

Problem: if any asychronous operations occur in the middleware stack before the
request body is parsed, the body will likely no longer be available.  The
request body stream must be paused until parsing can be done.

The pause-request-body package provides two simple middleware functions.  The
`pauser` function should be placed early in the middleware stack, before any
middleware that involves asynchronous operations.  The `resumer` function
should occur just before the body is parsed.  The request body stream will be
paused between the two.

## Getting Started
Install the module with: `npm install pause-request-body`

```javascript
//Connect middleware stack:
var pause_request_body = require( 'pause-request-body' );
var app= connect()
  // ...
  .use(pause_request_body.pauser())
  //.use(other middleware that may include asynchronous operations)
  .use(pause_request_body.resumer())
  //.use(bodyParser or other middleware that parses or loads the body)
  // ...
  .listen(80)
```

```javascript
//Express middleware stack:
var pause_request_body = require( 'pause-request-body' );
var app = express();
app.configure(function (){
  // ...
  app.use(pause_request_body.pauser())
  //app.use(other middleware that may include asynchronous operations)
  app.use(pause_request_body.resumer())
  //app.use(bodyParser or other middleware that parses or loads the body)
  // ...
})
```
## Release History
_(Nothing yet)_

[![Build Status](https://travis-ci.org/randymized/pause-request-body.png)](https://travis-ci.org/randymized/pause-request-body)

## License
Copyright (c) 2013 Randy McLaughlin
Licensed under the MIT license.
