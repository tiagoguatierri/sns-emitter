'use strict'

import chalk from 'chalk'
import figlet from 'figlet'
import inquirer from 'inquirer'

import { Setup } from './setup.js'
import { TopicUtils } from './topic-utils.js'

export class SNSEmitter {
  constructor(version) {
    this.version = version
  }

  async #listOptions() {
    const prompt = inquirer.createPromptModule()
    const { menu } = await prompt([
      {
        message: 'Select what you wish from the menu:',
        name: 'menu',
        type: 'list',
        choices: [
          {
            value: 'setup',
            name: '1. Setup SNS emitter'
          },
          {
            value: 'show_settings',
            name: '2. Show my settings'
          },
          {
            value: 'create_topic',
            name: '3. Create a new topic'
          },
          {
            value: 'edit_topic',
            name: '4. Edit a topic'
          },
          {
            value: 'dispatch_topics',
            name: '5. Dispatch an topic(s)'
          },
          {
            value: 'delete_topics',
            name: '6. Delete an topic(s)'
          },
          {
            value: 'exit',
            name: '7. Exit'
          }
        ]
      }
    ])

    await this.#handleSelectedOption(menu)
  }

  async #handleSelectedOption(selected) {
    switch (selected) {
      case 'setup':
        await this.#runSetup()
        break
      case 'show_settings':
        await this.#showSettings()
        break
      case 'create_topic':
        await this.#createTopic()
        break
      case 'edit_topic':
        await this.#editTopic()
        break
      case 'dispatch_topics':
        await this.#dispatchTopics()
        break
      case 'delete_topics':
        await this.#deleteTopics()
        break
      default:
        console.log(chalk.redBright('Thanks for use SNS Emitter! Bye.'))
    }
  }

  async #runSetup() {
    const prompt = inquirer.createPromptModule()

    console.log('\nFill in the fields to configure.')

    const config = await prompt([
      {
        message: 'Host:',
        name: 'host',
        default: 'http://127.0.0.1'
      },
      {
        message: 'Port:',
        name: 'port',
        default: 4003
      },
      {
        message: 'AWS account id',
        name: 'aws_account_id'
      },
      {
        message: 'AWS region',
        name: 'aws_region',
        default: 'us-east-1'
      }
    ])

    await Setup.updateConfig(config)
    await this.#listOptions()
  }

  async #showSettings() {
    const config = await Setup.getConfig()
    console.log(config)
    await this.#listOptions()
  }

  async #createTopic() {
    const prompt = inquirer.createPromptModule()
    const topic = await prompt([
      {
        message: 'Topic name:',
        name: 'name',
        validate: function (input) {
          const done = this.async()
          if (!input) {
            done('You need provide a name of topic.')
            return
          }
          done(null, true)
        }
      },
      {
        message: 'Topic request (JSON string format):',
        name: 'request',
        default: '{"message":"SNS Emitter is awesome!"}',
        validate: function (input) {
          const done = this.async()
          try {
            // Only check if json is valid
            JSON.parse(input)
            return done(null, true)
          } catch (error) {
            done('You need provide a valid JSON string format.')
          }
        }
      }
    ])

    await TopicUtils.addTopic(topic)
    await this.#listOptions()
  }

  async #editTopic() {
    const topics = await this.#getTopics()
    if (!topics.length) return topics

    const selected = await this.#createPromptTopicList(
      'Select witch topic wish to edit:',
      topics,
      'list'
    )

    const topic = await TopicUtils.getTopic(selected.topics)
    const prompt = inquirer.createPromptModule()
    const { request } = await prompt([
      {
        message: 'Editor',
        type: 'editor',
        name: 'request',
        default: topic.request,
        validate: function (input) {
          const done = this.async()
          try {
            JSON.stringify(input)
            done(null, true)
          } catch (error) {
            done('You need provide a valid JSON.')
            return
          }
        }
      }
    ])

    await TopicUtils.updateTopic({ ...topic, request })
    console.log(chalk.greenBright('\nTopic has been updated successfully!'))
    return this.#listOptions()
  }

  async #getTopics() {
    const topics = await TopicUtils.listTopics()
    if (!topics.length) {
      console.log(
        chalk.yellowBright(
          '\nNo items found. Please, create an topic on main menu.'
        )
      )
      return this.#listOptions()
    }
    return topics
  }

  async #dispatchTopics() {
    const topics = await this.#getTopics()
    if (!topics.length) return topics

    const selected = await this.#createPromptTopicList(
      'Select witch topics wish to dispatch:',
      topics
    )

    if (!selected.topics.length) {
      return this.#listOptions()
    }

    TopicUtils.prepare(topics, selected.topics)

    await TopicUtils.emit()
    return this.#dispatchTopics()
  }

  async #deleteTopics() {
    const topics = await TopicUtils.listTopics()
    const selected = await this.#createPromptTopicList(
      'Select witch topics wish to delete:',
      topics
    )

    if (!selected.topics.length) {
      console.log(chalk.yellowBright('\nNo items have been selected.'))
    }

    const deleted = await TopicUtils.deleteTopic(...selected.topics)
    if (deleted) {
      console.log(
        chalk.greenBright('\nTopic(s) has been deleted successfully!')
      )
    }

    await this.#listOptions()
  }

  async #createPromptTopicList(message, topics, type = 'checkbox') {
    const prompt = inquirer.createPromptModule()
    return prompt([
      {
        message,
        name: 'topics',
        type,
        choices: topics.map(({ name }) => ({
          name: name,
          value: name
        }))
      }
    ])
  }

  async run() {
    console.log(figlet.textSync('SNS Emitter'))
    console.log(
      chalk.redBright(
        `Welcome to SNS Emitter. A simple way to dispatch offline SNS events to serverless applications.\nVersion: ${this.version}\n`
      )
    )

    await this.#listOptions()
  }
}
