/**
 * Implements utilities for manipulating incoming queue messages
 *
 * @module util/message
 */

const crypto = require("crypto")

/**
 * Returns the message body of any given queue message.
 *
 * The body must be json parseable.
 *
 * @param {Object<any,any>} message - The received queue message
 *
 * @returns {Object<any,any>} The parsed message body
 *
 * @static
 * @function
 */
function getBatch(message) {
  const { messageId, receiptHandle, body, md5OfBody } = message

  if (isValidMessageBody(body, md5OfBody)) {
    return {
      messageId,
      receiptHandle,
      proxy: null,
      batch: JSON.parse(message.body),
    }
  } else {
    throw new Error("The message body does not match the expected content")
  }
}

/**
 * Validates the correctness of a given message body by computing the MD5 hash
 * of the body and comparing it to the message provided hash.
 *
 * @param {string} body - The received message body
 * @param {string} md5OfBody - The received message md5 of body
 *
 * @returns {boolean} - Returns true when the md5 of body matches the message provided hash
 *
 * @static
 * @inner
 * @function
 */
function isValidMessageBody(body, md5OfBody) {
  const digest = crypto
    .createHash("md5")
    .update(body)
    .digest("hex")

  return digest === md5OfBody
}

// Exports
module.exports = {
  getBatch,
}
