/**
 * Internal cache, this is where the magic happens.
 */

/**
 * Imports
 */
var log = require("./log");

var _cache,
    _timeoutPointers;

function Cache() {
    _cache = {};
    _timeoutPointers = {};
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
    },

    /**
     * Decrements a numeric value in the cache and returns the new value
     *
     * @param key - The key of the value to decrement, if not set, initializes the value to zero and decrement
     * @param decrementBy - (Optional: Default 1)
     * @return - Returns either the decremented value, or an Error
     */
    decr: function(key, decrementBy) {
        log.info("DECR: ["+key+", "+decrementBy+"]");

        // Ensure a valid decrementBy value has been passed
        decrementBy = getNumericValue(decrementBy, 1, "ERROR: Invalid value [" + decrementBy + "] to decrement by, must be a number.");
        if (decrementBy instanceof Error) {
            return decrementBy;
        }

        // If the cache doesn't contain the KEY, default it to zero
        var cachedValue = this.get(key);
        cachedValue = getNumericValue(this.get(key), 0, "ERROR: Invalid cached value [" + cachedValue + "] to decrement by, must be a number.");
        if (cachedValue instanceof Error) {
            return cachedValue;
        }

        // Decrement the value and set it in the cache
        cachedValue -= decrementBy;
        if (this.set(key, cachedValue)) {
            return cachedValue;
        } else {
            return new Error("ERROR: Failed to SET decremented value [" + cachedValue + "] for key: " + key);
        }
    },

    /**
     * Expires a key after timeInMillis from now has passed, modifying the existing expire time if set
     *
     * @param key
     * @param timeInMillis
     */
    expire: function(key, timeInMillis) {
        log.info("EXPIRE: ["+key+", "+timeInMillis+"]");

        // Ensure a valid timeInMillis has been passed
        var errorString = "ERROR: Invalid timeInMillis passed to EXPIRE: " + timeInMillis;
        timeInMillis = getNumericValue(timeInMillis, new Error(errorString), errorString);
        if (timeInMillis instanceof Error) {
            return timeInMillis;
        }

        // Check if there is an existing expire time, and if so, wipe it
        var existingTimeoutPointer = _timeoutPointers[key];
        if (existingTimeoutPointer != null && typeof existingTimeoutPointer !== 'undefined') {
            clearTimeout(existingTimeoutPointer);
        }

        // Set the new expire time
        var $this = this;
        _timeoutPointers[key] = setTimeout(function() {
            $this.del(key);
        }, timeInMillis);

        return true;
    },

    /**
     * Returns a random key from the cache
     */
    random: function() {
        log.info("RANDOM");

        var cachedKeys = Object.keys(_cache);
        if (cachedKeys.length > 0) {
            var indexOfRandomKey = getRandomInt(0, cachedKeys.length);
            return [cachedKeys[indexOfRandomKey]];
        } else {
            return [null];
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}