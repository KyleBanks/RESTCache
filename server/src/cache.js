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
     * Returns PONG
     * @returns {string}
     */
    ping: function() {
        return "PONG";
    },

    /**
     * Set a key=value pair in the cache
     * @param key
     * @param value
     */
    set: function(key, value) {
        log.info("SET: [" + key+"="+value + "]");

        _cache[key] = value;
        return true;
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
        return true;
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
     * @param incrementBy - (Optional: Default 1)
     * @return - Returns either the incremented value, or an Error
     */
    incr: function(key, incrementBy) {
        log.info("INCR: ["+key+", "+incrementBy+"]");

        // Ensure a valid incrementBy value has been passed
        incrementBy = getNumericValue(incrementBy, 1, "ERROR: Invalid value [" + incrementBy + "] to increment by, must be a number.");
        if (incrementBy instanceof Error) {
            return incrementBy;
        }

        // If the cache doesn't contain the KEY, default it to zero
        var cachedValue = this.get(key);
        cachedValue = getNumericValue(this.get(key), 0, "ERROR: Invalid cached value [" + cachedValue + "] to increment by, must be a number.");
        if (cachedValue instanceof Error) {
            return cachedValue;
        }

        // Increment the value and set it in the cache
        cachedValue += incrementBy;
        if (this.set(key, cachedValue)) {
            return cachedValue;
        } else {
            return new Error("ERROR: Failed to SET incremented value [" + cachedValue + "] for key: " + key);
        }
    }

};

/**
 * Public
 * @type {Cache}
 */
module.exports = Cache;


/**
 * Private Helpers
 */

function getNumericValue(value, defaultValue, errorMessage) {
    if (value == null || typeof value === 'undefined') {
        value = defaultValue;
    } else if(isNaN(value)) {
        value = new Error(errorMessage);
    } else {
        value = parseInt(value);
    }

    return value;
}