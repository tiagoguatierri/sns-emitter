'use strict'

import AWS from 'aws-sdk'
import config from '../../../config.json' assert { type: 'json' }

AWS.config.update({ region: config.aws_region })

export class SNSEvent {
  #topicArn
  #sns

  constructor(topicName, port = config.port) {
    this.#topicArn = `arn:aws:sns:${config.aws_region}:${config.aws_account_id}:${topicName}`
    this.#sns = new AWS.SNS({
      endpoint: `${config.host}:${port}`
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
