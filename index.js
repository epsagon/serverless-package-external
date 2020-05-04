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

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.beforeDeploy.bind(this),
      'before:deploy:function:packageFunction': this.beforeDeploy.bind(this),
      'after:deploy:function:packageFunction': this.afterDeploy.bind(this),
      'after:package:createDeploymentArtifacts': this.afterDeploy.bind(this),
      "before:offline:start:init": this.beforeDeploy.bind(this),
      "before:offline:start:end": this.afterDeploy.bind(this),
      "invoke:local:loadEnvVars": this.beforeDeploy.bind(this),
      "invoke:local:invoke": this.afterDeploy.bind(this)
    };

    this.handleExit();
  }

  beforeDeploy() {
    // Symlink external folders
    return Promise.all(this.options.external.map(externalFolder => {
        this.symlinked = true;
        return symlink.createFolder(externalFolder, this.serverless);
      }))
      .then(() => {
        this.serverless.cli.log(`[serverless-package-external] is complete`);
      });
  }

  afterDeploy() {
    if(this.symlinked) {
      this.options.external.forEach(externalFolder => {
        const target = path.basename(externalFolder);
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
