'use strict'

import AWS from 'aws-sdk'
import config from '../config.json' assert { type: 'json' }

AWS.config.update({ region: config.aws.region })

export class SNSEvent {
  #topicArn
  #sns

  constructor(topicName, port = config.port) {
    this.#topicArn = `arn:aws:sns:${config.aws.region}:${config.aws.accountId}:${topicName}`
    this.#sns = new AWS.SNS({
      endpoint: `${config.host}:${port}`
    })
  }

  async emit(request) {
    try {
      return this.#sns
        .publish({
          Message: JSON.stringify(request),
          TopicArn: this.#topicArn
        })
        .promise()
    } catch (error) {
      console.error('SNSEventEmitter#emit', {
        eventName: 'SNSEventEmitterError',
        code: error.code,
        region: error.region,
        hostname: error.hostname,
        request: JSON.stringify(request)
      })
    }
  }
}
