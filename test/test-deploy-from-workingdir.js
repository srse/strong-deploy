// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var debug = require('debug')('test');
var helpers = require('./helpers');
var os = require('os');
var shell = require('shelljs');

var performGitDeployment = require('../lib/git').performGitDeployment;

shell.exec('git branch deploy');

helpers.gitServer(test);

function test(server, ci) {
  ci.once('commit', assertCommit);
  var workingDir = __dirname;
  var baseUrl = 'http://127.0.0.1:' + server.address().port;
  process.chdir(os.tmpdir());

  debug('workingDir: %s', workingDir);
  performGitDeployment(
    {
      workingDir: workingDir,
      baseURL: baseUrl,
      serviceName: 'svc',
      branchOrPack: 'deploy',
    },
    function(err) {
      assert.ifError(err);
    });

  function assertCommit(commit) {
    assert(commit.repo === 'default');
    var branch = 'deploy';
    assert(!(branch instanceof Error));
    assert(commit.branch === branch);
    helpers.ok = true;
    server.close();
  }
}
