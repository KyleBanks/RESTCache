/**
 * RCError.js
 *
 * Custom error type used by RESTCache internals.
 */

/**
 * RCError Constructor
 * @param message The string error message
 * @param index The index that the error occurred at
 * @constructor
 */
function RCError(message, index) {
    this.message = message;
    this.index = index;
}

RCError.prototype = {

};


/**
 * Public
 * @type {RCError}
 */
module.exports = RCError;