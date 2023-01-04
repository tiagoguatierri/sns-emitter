import chalk from 'chalk'
import figlet from 'figlet'
import pkg from './package.json' assert { type: 'json' }
import { SNSEmitter } from './src/sns-emitter.js'

async function bootstrap() {
  const snsEmitter = new SNSEmitter()

  console.log('\n\n')
  console.log(figlet.textSync('SNS Emitter'))
  console.log(
    chalk.redBright(
      `Welcome to SNS Emitter. A simple way to dispatch offline SNS events to serverless applications.\nVersion: ${pkg.version}`
    )
  )
  console.log('\n')

  const topics = await snsEmitter.getTopics()
  const { selected } = await snsEmitter.listOptions(topics)
  const topicsToEmit = await snsEmitter.handleTopics(topics, selected)
  await snsEmitter.emitTopic(topicsToEmit)
}

bootstrap().catch(console.error)
