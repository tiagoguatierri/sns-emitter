'use strict'

import AWS from 'aws-sdk'

import { Setup } from './setup.js'

const config = await Setup.getConfig()

export class SNSTopic {
  #topicArn
  #sns

  constructor(topicName) {
    console.log(config.port)
    this.#topicArn = `arn:aws:sns:${config.aws_region}:${config.aws_account_id}:${topicName}`
    this.#sns = new AWS.SNS({
      endpoint: `${config.host}:${config.port}`
    })
  }

  async emit(request) {
    try {
      return this.#sns
        .publish({
          Message: request,
          TopicArn: this.#topicArn
        })
        .promise()
    } catch (error) {
      console.error('SNSTopic#emit', {
        eventName: 'SNSTopicEmitError',
        error
      })
    }
  }
}
