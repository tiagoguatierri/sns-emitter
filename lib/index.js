import { SNSEmitter } from './src/app.js'

/* async function runSNSEmitter() {
  const snsEmitter = new SNSEmitter()
  const topics = await snsEmitter.getTopics()
  const { selected } = await snsEmitter.listOptions(topics)
  const topicsToEmit = await snsEmitter.handleTopics(topics, selected)
  await snsEmitter.emitTopic(topicsToEmit)
} */

export default async function bootstrap() {
  await new SNSEmitter().run()

  // await runSNSEmitter()
}
