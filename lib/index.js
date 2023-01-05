import AWS from 'aws-sdk'

import { Setup } from './src/core/setup.js'
import { SNSEmitter } from './src/app.js'

const config = await Setup.getConfig()

AWS.config.update({ region: config.aws_region })

export default async function bootstrap() {
  await new SNSEmitter().run()
}
