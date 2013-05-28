
/*
 * pause-request-body
 * https://github.com/randymized/pause-request-body
 *
 * Copyright (c) 2013 Randy McLaughlin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function()
{
  return {
    pauser: function() {
      return function(req, res, next) {
        if (!(req.method === 'POST' || req.method === 'PUT')) return next();
        req._paused = true;
        req.pause();
        next();
      };
    },
    resumer: function() {
      return function(req, res, next) {
        if (!req._paused) return next();
        req._paused = false;
        req.resume();
        next();
      };
    }
  }
};
