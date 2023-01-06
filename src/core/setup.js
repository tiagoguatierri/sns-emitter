'use strict'

import { access, readFile, writeFile, constants } from 'fs/promises'
import { resolve } from 'path'

const CONFIG_DIR = resolve(process.cwd(), 'config.json')

export class Setup {
  static config

  static async #createConfig() {
    try {
      const config = {
        host: 'http://127.0.0.1',
        port: 4003,
        aws_account_id: '',
        aws_region: 'us-east-1'
      }
      await this.setConfig(config)
    } catch (error) {
      console.error('Setup#createFileConfig', {
        eventName: 'SetupCreateFileConfigError',
        error
      })
    }
  }

  static async getConfig() {
    try {
      if (this.config) return this.config
      const json = await readFile(CONFIG_DIR, 'utf8')
      return JSON.parse(json)
    } catch (error) {
      console.error('Setup#getConfig', {
        eventName: 'SetupGetConfigError',
        error
      })
    }
  }

  static async setConfig(config) {
    this.config = config
    try {
      const json = JSON.stringify(this.config, null, 2)
      await writeFile(CONFIG_DIR, json, 'utf8')
    } catch (error) {
      console.error('Setup#setConfig', {
        eventName: 'SetupSetConfigError',
        error
      })
    }
  }

  static async updateConfig(partial) {
    try {
      const config = await this.getConfig()
      await this.setConfig(Object.assign(config, partial))
    } catch (error) {
      console.error('Setup#updateConfig', {
        eventName: 'SetupUpdateConfigError',
        error
      })
    }
  }

  static async init() {
    try {
      await access(CONFIG_DIR, constants.F_OK)
    } catch (error) {
      this.#createConfig()
    }
  }
}

await Setup.init()
