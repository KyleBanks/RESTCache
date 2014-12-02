/**
 * Internal cache, this is where the magic happens.
 */

/**
 * Imports
 */
var log = require("./log");

var cache = {};

/**
 * Set a key=value pair in the cache
 * @param key
 * @param value
 */
module.exports.set = function(key, value) {
    log.info("SET: [" + key+"="+value + "]");

    cache[key] = value;
};

/**
 * Retrieve the value of a key=value pair from the cache
 */
module.exports.get = function(key) {
    log.info("GET: [" + key + "]");

    return cache[key];
};

module.exports.del = function(key) {
    log.info("DEL: [" + key + "]");

    delete cache[key];
};