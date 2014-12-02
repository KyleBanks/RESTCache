/**
 * Internal cache, this is where the magic happens.
 */

/**
 * Imports
 */
var log = require("./log");

var _cache;

function Cache() {
    _cache = {};
}

Cache.prototype = {

    /**
     * Set a key=value pair in the cache
     * @param key
     * @param value
     */
    set: function(key, value) {
        log.info("SET: [" + key+"="+value + "]");

        _cache[key] = value;
    },

    /**
     * Retrieve the value of a key=value pair from the cache
     * @param key
     */
    get: function(key) {
        log.info("GET: [" + key + "]");

        return _cache[key];
    },

    /**
     * Delete a key=pair from the cache
     * @param key
     */
    del: function(key) {
        log.info("DEL: [" + key + "]");

        delete _cache[key];
    },

    /**
     * Returns all the keys in the cache
     */
    keys: function() {
        log.info("KEYS");

        var keys = [];
        for (var key in _cache) {
            keys.push(key);
        }
        return keys;
    }

};

/**
 * Public
 * @type {Cache}
 */
module.exports = Cache;