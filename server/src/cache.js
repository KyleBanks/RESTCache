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

        return Object.keys(_cache);
    },

    /**
     * Increments a numeric value in the cache and returns the new value
     *
     * @param key - The key of the value to increment, if not set, initializes the value to zero and increment
     * @param value - (Optional: Default 1)
     * @return - Returns either the incremented value, or an Error
     */
    incr: function(key, value) {
        log.info("INCR: ["+key+", "+value+"]");

        // Ensure a valid value
        if (value == null || typeof value === 'undefined') {
            value = 1;
        } else if(isNaN(value)) {
            return new Error("ERROR: Invalid value [" + value + "] to increment by, must be a number.");
        } else {
            value = parseInt(value);
        }

        // If the cache doesn't contain the KEY, default it to zero
        var cachedValue = this.get(key);
        if (typeof cachedValue === 'undefined') {
            cachedValue = 0;
        } else if(isNaN(cachedValue)) {
            return new Error("ERROR: Invalid existing value [" + cachedValue + "] to increment by, must be a number.");
        } else {
            cachedValue = parseInt(cachedValue);
        }

        // Increment the value and set it in the cache
        cachedValue += value;
        this.set(key, cachedValue);

        return cachedValue;
    }

};

/**
 * Public
 * @type {Cache}
 */
module.exports = Cache;