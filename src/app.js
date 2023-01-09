'use strict'

import { Setup } from './core/setup.js'
import { SNSEmitter } from './core/sns-emitter.js'
import AWS from 'aws-sdk'
import pkg from '../package.json' assert { type: 'json' }

const config = await Setup.getConfig()
AWS.config.update({ region: config.aws_region })

await new SNSEmitter(pkg.version).run()
