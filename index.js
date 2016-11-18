'use strict'
const AWS = require('aws-sdk')

/**
   * Converts Javascript Object into SQS Message Attributes
   *
   * @name convertJSObjectToSQSAttributes
   * @function
   * @param {object} jsObj Javascript Object that needs to be converted
   * @throws if jsObjs is not an object
   * TODO: Throw Error if nested Object
   * TODO: Convert to more types than just string
 */
function convertJSObjectToSQSAttributes (jsObj) {
  let sqsAttribute = {}
  for (var prop in jsObj) {
    if (jsObj.hasOwnProperty(prop)) {
      sqsAttribute[prop] = {
        DataType: 'String',
        StringValue: jsObj[prop]
      }
    }
  }
  return sqsAttribute
}

/**
   * Converts Array of SQS Attributes into a JS Object
   *
   * @name convertSQSAttributesToJSObject
   * @function
   * @param {object} SQSAttributes javascript object returned from SQS
   * @throws if SQSAttributes is not an object 
   * TODO: Convert to more types than just string
 */

function convertSQSAttributesToJSObject (SQSAttributes) {
  let jsObj = {}
  for (var prop in SQSAttributes) {
    if (SQSAttributes.hasOwnProperty(prop)) {
      jsObj[prop] = SQSAttributes[prop].StringValue
    }
  }
  return jsObj
}

/**
   * Create SQS message
   *
   * @name send
   * @function
   * @param {string} QueueUrl Url to the aws queue
   * @param {string} Body Message to go in the body
   * @param {object} Attributes Object with message attributes  
   * @throws error creating message
   *
  */

exports.send = function (QueueUrl, Body, Attributes) {
  const sqs = new AWS.SQS()

  let params = {
    MessageBody: Body,
    QueueUrl: QueueUrl,
    MessageAttributes: convertJSObjectToSQSAttributes(Attributes)
  }
  return sqs.sendMessage(params).promise()
  .catch((err) => {
    throw new Error(err)
  })
}

/**
   * Get Next Message SQS Queue
   *
   * @name next
   * @function
   * @param {string} QueueUrl Url to the aws queue  
   * @throws error creating message
   *
  */

exports.next = function (QueueUrl) {
  const sqs = new AWS.SQS()

  let params = {
    AttributeNames: [
      'All'
    ],
    MessageAttributeNames: [
      'All'
    ],
    QueueUrl,
    MaxNumberOfMessages: 1
  }

  return sqs.receiveMessage(params).promise()
  .then((message) => {
    if (message.Messages.length === 0) {
      return null
    }
    return {
      ReceiptHandle: message.Messages[0].ReceiptHandle,
      MessageId: message.Messages[0].MessageId,
      Body: message.Messages[0].Body,
      ...convertSQSAttributesToJSObject(message.Messages[0].MessageAttributes)
    }
  })
  .catch((err) => {
    throw new Error(err)
  })
}

/**
   * Delete SQS message
   *
   * @name delete
   * @function
   * @param {string} QueueUrl Url to the aws queue
   * @param {string} Body Message to go in the body
   * @param {object} Attributes Object with message attributes  
   * @throws error creating message
   *
  */

exports.delete = function (QueueUrl, ReceiptHandle) {
  const sqs = new AWS.SQS()

  let params = {
    QueueUrl,
    ReceiptHandle
  }

  return sqs.deleteMessage(params).promise()
  .catch((err) => {
    throw new Error(err)
  })
}
