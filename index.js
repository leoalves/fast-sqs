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

exports.sendMessage = function (QueueUrl, Body, Attributes) {
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
