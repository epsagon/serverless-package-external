'use strict';

const symlink = require('./src/symlink');
const path = require('path');


class PackageExternal {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = Object.assign({
      external: []
    }, this.serverless.service.custom && this.serverless.service.custom.packageExternal || {});

    this.symlinked = false;

    this.commands = {
      packageExternal: {
        usage: 'create external package symlinks',
        lifecycleEvents: ['run'],
        commands: {
          run: {
            usage: 'remove symlinks',
            lifecycleEvents: ['init'],
          },
        },
      },
    };

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.beforeDeploy.bind(this),
      'before:deploy:function:packageFunction': this.beforeDeploy.bind(this),
      'after:deploy:function:packageFunction': this.afterDeploy.bind(this),
      'after:package:createDeploymentArtifacts': this.afterDeploy.bind(this),
      "before:offline:start:init": this.beforeDeploy.bind(this),
      "before:offline:start": this.beforeDeploy.bind(this),
      "before:offline:start:end": this.afterDeploy.bind(this),
      "invoke:local:loadEnvVars": this.beforeDeploy.bind(this),
      "invoke:local:invoke": this.afterDeploy.bind(this),
      "packageExternal:run:init": this.beforeDeploy.bind(this),
    };

    this.handleExit();
  }

  beforeDeploy() {
    // Symlink external folders
    return Promise.all(this.options.external.map(externalFolder => {
        this.symlinked = true;
        const folderWithoutAstrix = externalFolder.split('*').join('');
        return symlink.createFolder(folderWithoutAstrix, this.serverless);
      }))
      .then(() => {
        this.serverless.cli.log(`[serverless-package-external] is complete`);
      });
  }

  afterDeploy() {
    if(this.symlinked) {
      this.serverless.cli.log(`[serverless-package-external] cleaning up`);
      this.options.external.forEach(externalFolder => {
        const folderWithoutAstrix = externalFolder.split('*').join('');
        const target = path.basename(folderWithoutAstrix);
        symlink.removeFolder(target);
      });
    }
  }

  handleExit(func) {
    ['SIGINT', 'SIGTERM', 'SIGQUIT']
      .forEach(signal => process.on(signal, () => {
        this.afterDeploy();
      }));
  }
}

module.exports = PackageExternal;
