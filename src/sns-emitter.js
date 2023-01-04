'use strict'

import chalk from 'chalk'
import inquirer from 'inquirer'
import { readFile } from 'fs/promises'
import { SNSEvent } from './sns-event.js'

export class SNSEmitter {
  async getTopics() {
    try {
      const context = await readFile('topics.json', 'utf8')
      return JSON.parse(context)
    } catch (error) {
      console.error('getItemsError', {
        eventName: 'main#getItems',
        error
      })
    }
  }

  async handleTopics(topics, selected) {
    return topics
      .filter(({ topicName }) => selected.includes(topicName))
      .map(({ topicName, request }) => ({
        topicName,
        request,
        emitter: new SNSEvent(topicName)
      }))
  }

  async listOptions(topics) {
    return inquirer.prompt([
      {
        message: 'Select witch topics wish to dispatch:',
        name: 'selected',
        type: 'checkbox',
        choices: topics.map(({ topicName }) => ({
          name: topicName,
          value: topicName
        }))
      }
    ])
  }

  async emitTopic(topics) {
    if (!topics.length) {
      console.log(chalk.yellowBright('No items have been selected.'))
      return
    }
    try {
      console.log(topics)
      const response = await Promise.all(
        topics.map(async ({ topicName, request, emitter }) => {
          const { MessageId } = await emitter.emit(request)
          return {
            TopicName: topicName,
            MessageId
          }
        })
      )
      console.log(chalk.greenBright('\nTopics has been fired successfully!'))
      console.table(response)
    } catch (error) {
      console.error(error)
    }
  }
}
