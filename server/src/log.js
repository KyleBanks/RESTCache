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

// Only output DEBUG level messages when debug is true
if (Config.misc.debug == true) {
    module.exports.debug = function(message) {
        console.log(message);
    };
} else {
    module.exports.debug = function(message) {
        // Do Nothing
    };
}

// ERROR level logging
module.exports.error = function(message) {
    console.error(message);
};

// Force INFO level log output
module.exports.force = function(message) {
    console.log(message);
};