'use strict'

import chalk from 'chalk'

import { access, readFile, writeFile, constants } from 'fs/promises'
import { resolve } from 'path'
import { cwd } from 'process'

import { SNSTopic } from './sns-topic.js'

const TOPICS_DIR = resolve(cwd(), 'topics.json')

export class TopicUtils {
  static topics = []

  static async listTopics() {
    try {
      const json = await readFile(TOPICS_DIR, 'utf8')
      return JSON.parse(json)
    } catch (error) {
      console.error('TopicUtils#listTopics', {
        eventName: 'TopicUtilsListTopicsError',
        error
      })
    }
  }

  static async setTopic(topics) {
    try {
      const json = JSON.stringify(topics, null, 2)
      await writeFile(TOPICS_DIR, json, 'utf8')
    } catch (error) {
      console.error('TopicUtils#setTopic', {
        eventName: 'TopicUtilsSetTopicError',
        error
      })
    }
  }

  static async addTopic(topic) {
    try {
      const topics = await this.listTopics()
      topics.push(topic)
      await this.setTopic(topics)
    } catch (error) {
      console.error('TopicUtils#addTopic', {
        eventName: 'TopicUtilsAddTopicError',
        error
      })
    }
  }

  static async deleteTopic(...topicName) {
    if (!topicName?.length) return
    try {
      const topics = await this.listTopics()
      await this.setTopic(
        topics.filter((topic) => !topicName.includes(topic.name))
      )
      return true
    } catch (error) {
      console.error('TopicUtils#deleteTopic', {
        eventName: 'TopicUtilsDeleteTopicError',
        error
      })
    }
  }

  static prepare(topics, selected) {
    this.topics = topics
      .filter(({ name }) => selected.includes(name))
      .map(({ name, request }) => ({
        name,
        request,
        emitter: new SNSTopic(name)
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
        ...error.originalError
      })
    }
  }

  static async init() {
    try {
      await access(TOPICS_DIR, constants.F_OK)
    } catch (error) {
      this.setTopic([])
    }
  }
}

await TopicUtils.init()
