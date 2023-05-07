'use strict';

const fs = require('fs')
const path = require('path')

class PackageExternal {
  constructor(serverless) {
    this.serverless = serverless
    this.options = this.serverless.service?.custom?.packageExternal || {}
    this.hooks = {
      'before:package:initialize': this.beforePackage.bind(this),
      'after:package:finalize': this.afterPackage.bind(this)
    }
    this.handleExit(['SIGINT', 'SIGTERM', 'SIGQUIT'])
  }

  applyAction(callback) {
    const slsFns = this.serverless.service?.functions || {}
    const images = this.serverless.service?.provider?.ecr?.images || {}

    for (const [externalFolder, { functions, source }] of Object.entries(this.options)) {
      for (const name of functions || Object.keys(slsFns)) {
        const slsFn = slsFns[name]
        const imagePath = images?.[slsFn?.image?.name]?.path || slsFn?.image?.path
        const target = path.join(process.cwd(), imagePath || slsFn?.module || '', externalFolder)
        callback({ name, externalFolder, source, target, log: this.serverless.cli.log })
      }
    }
  }

  beforePackage() {
    // Symlink external folders
    this.applyAction(({ name, externalFolder, source, target, log }) => {
      const noSource = !fs.existsSync(source)
      if (fs.existsSync(target) || noSource) {
        const issue = noSource ? `${source} does not exist` : `${target} already exists`
        log(`[serverless-package-external] cannot Symlink function: ${name}, ${issue}`)
      } else {
        // Junction is used on windows so that no administrator privileges are required
        fs.symlinkSync(path.join(process.cwd(), source), target, process.platform === 'win32' && 'junction')
        log(`[serverless-package-external] Symlinked "${externalFolder}" for function: ${name}`)
      }
    })
  }

  afterPackage() {
    // Cleanup generated symlinks
    this.applyAction(({ name, externalFolder, target, log }) => {
      if (fs.existsSync(target) && fs.rmSync(target, { recursive: true, force: true })) {
        log(`[serverless-package-external] Cleanup "${externalFolder}" for function: ${name}`)
      }
    })
  }

  handleExit(signals) {
    for (const signal of signals) {
      process.on(signal, () => this.afterPackage())
    }
  }
}

module.exports = PackageExternal
