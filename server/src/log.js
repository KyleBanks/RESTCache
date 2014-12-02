/**
 * log.js
 *
 * General logger.
 */

/**
 * Imports
 */
var Config = require('../conf/config');

/**
 * Public functions
 */

// Only output INFO level messages when debug is true
if (Config.debug == true) {
    module.exports.info = function(message) {
        console.log(message);
    };
} else {
    module.exports.info = function(message) {
        // Do Nothing
    };
}

// Force INFO level log output
module.exports.force = function(message) {
    console.log(message);
};