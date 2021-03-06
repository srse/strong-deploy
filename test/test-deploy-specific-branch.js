// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: strong-deploy
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var assert = require('assert');
var childProcess = require('child_process');
var shell = require('shelljs');
var helpers = require('./helpers');

var getCurrentBranch = require('../lib/git.js')._getCurrentBranch;
var currentBranch = getCurrentBranch(process.cwd());

// Ensure that master and production exist as local branches
shell.exec('git branch master origin/master');
shell.exec('git branch production origin/production');

var pushBranch = 'production';
// Jenkins runs tests in detached state which would cause currentBranch()
// to return an Error object. Just use the master branch in that case.
if (currentBranch instanceof Error || currentBranch === 'production') {
  pushBranch = 'master';
}

helpers.gitServer(function(server, ci) {
  ci.once('commit', assertCommit);
  childProcess.fork(
    require.resolve('../bin/sl-deploy'),
    [
      '--service', 's1',
      'http://127.0.0.1:' + server.address().port, pushBranch
    ]
  );

  function assertCommit(commit) {
    assert(commit.branch === pushBranch);
    helpers.ok = true;
    server.close();
  }
});
