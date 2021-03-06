// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var childProcess = require('child_process');
var helpers = require('./helpers');

var handler = helpers.findServiceAndRunHandler.bind(null, assertPut);
var server = helpers.httpServerAllow(handler, doPut);

function assertPut(req, res) {
  assert(req.method === 'PUT');
  helpers.ok = true;

  res.end();
  server.close();
}

function doPut(server, _ci) {
  var port = server.address().port;
  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    [
      '--service', 's1',
      'http://always:allow@127.0.0.1:' + port,
      __filename
    ]
  );
}
