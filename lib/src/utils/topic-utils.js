'use strict'

import chalk from 'chalk'

import { SNSEvent } from '../core/sns-event.js'

export class TopicUtils {
  static topics = []

  static prepare(topics, selected) {
    this.topics = topics
      .filter(({ name }) => selected.includes(name))
      .map(({ name, request }) => ({
        name,
        request,
        emitter: new SNSEvent(name)
      }))
  }

  static async emit() {
    if (!this.topics.length) {
      console.log(chalk.yellowBright('\nNo items have been selected.'))
      return
    }
    try {
      const response = await Promise.all(
        this.topics.map(async ({ name, request, emitter }) => {
          const { MessageId } = await emitter.emit(request)
          return {
            TopicName: name,
            MessageId
          }
        })
      )
      console.log(chalk.greenBright('\nTopic(s) has been fired successfully!'))
      console.table(response)
    } catch (error) {
      console.error('TopicUtils#emit', {
        eventName: 'TopicUtilsEmitError',
        error
      })
    }
  }
}
