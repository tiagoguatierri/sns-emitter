'use strict'

import { access, readFile, writeFile, constants } from 'fs/promises'
import { resolve } from 'path'
import { cwd } from 'process'

const TOPICS_DIR = resolve(cwd(), 'topics.json')

export class Topic {
  async list() {
    try {
      const json = await readFile(TOPICS_DIR, 'utf8')
      return JSON.parse(json)
    } catch (error) {
      console.error('Topic#list', {
        eventName: 'TopicListError',
        error
      })
    }
  }

  async set(topics) {
    try {
      const json = JSON.stringify(topics, null, 2)
      await writeFile(TOPICS_DIR, json, 'utf8')
    } catch (error) {
      console.error('Topic#set', {
        eventName: 'TopicSetError',
        error
      })
    }
  }

  async add(topic) {
    try {
      const topics = await this.list()
      topics.push(topic)
      await this.set(topics)
    } catch (error) {
      console.error('Topic#add', {
        eventName: 'TopicAddError',
        error
      })
    }
  }

  async delete(...topicName) {
    if (!topicName?.length) return
    try {
      const topics = await this.list()
      await this.set(topics.filter((topic) => !topicName.includes(topic.name)))
      return true
    } catch (error) {
      console.error('Topic#delete', {
        eventName: 'TopicDeleteError',
        error
      })
    }
  }

  async run() {
    try {
      await access(TOPICS_DIR, constants.F_OK)
    } catch (error) {
      this.setTopics([])
    }
  }
}
