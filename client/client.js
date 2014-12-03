/**
 * Imports
 */
var request = require("request");

/**
 * Constructs a new RESTCache client
 * @param host In the format of protocol://hostname:port (ex. http://localhost:7654)
 * @param debug (Optional: default false) If enabled, logs all calls to the cache
 * @constructor
 */
function RESTCache(host, debug) {
    // Ensure the host doesn't end in '/'
    if (host.substr(-1) === "/") {
        host = host.substring(0, host.length - 2);
    }

    this.serverUrl = host;
    this.debug = debug;

    this.log("RESTCache initialized with host " + this.serverUrl);
}

RESTCache.prototype = {

    /**
     * Attempts to verify connection to the cache by sending a PING request
     * @param cb
     */
    ping: function(cb) {
        var $this = this;
        $this.log("PING");

        sendGET($this.serverUrl, "/ping", cb);
    },

    /**
     * Sets a value(s) in the cache with a specified KEY(s)
     * @param keySet
     * @param valueSet
     * @param cb
     */
    set: function(keySet, valueSet, cb) {
        var $this = this;
        $this.log("SET [" + keySet + "] = [" + valueSet+"]");

        // Normalize the input into encoded arrays
        var keys = normalizeArray(keySet);
        var values = normalizeArray(valueSet);

        // Sanity check
        if (keys.length != values.length) {
            cb(new Error("Length of keys must equal the length of values."));
            return;
        }

        // Now construct a proper URL formatted key=value set
        var keyValueSet = [];
        for (var i = 0; i < keys.length; i++) {
            keyValueSet.push(keys[i] + "=" + values[i]);
        }

        sendGET($this.serverUrl, "/set?" + keyValueSet.join("&"), cb);
    },

    /**
     * Gets a value(s) from the cache with the specified KEY(s)
     * @param key
     */
    get: function(key, cb) {
        var $this = this;
        $this.log("GET [" + key + "]");

        // Normalize the keys
        var keys = normalizeArray(key);

        sendGET($this.serverUrl, "/get?" + keys.join("&"), cb);
    },

    /**
     * Deletes a value(s) from the cache with the specified KEY(s)
     * @param key
     * @param cb
     */
    del: function(key, cb) {
        var $this = this;
        $this.log("DEL [" + key + "]");

        // Normalize the keys
        var keys = normalizeArray(key);

        sendGET($this.serverUrl, "/del?" + keys.join("&"), cb);
    },

    /**
     * Returns all of the keys from the cache
     * @param cb
     */
    keys: function(cb) {
        var $this = this;
        $this.log("KEYS");

        sendGET($this.serverUrl, "/keys", cb);
    },

    /**
     * Increments a numeric value corresponding to the key(s) passed and returns the new value(s)
     *
     * @param key
     * @param incrementBy - Either an integer value to increment by (for each KEY if an Array), or null to default to 1
     * @param cb
     */
    incr: function(key, incrementBy, cb) {
        var $this = this;
        $this.log("INCR ["+key+", "+incrementBy+"]");

        // Normalize the keys
        var keys = normalizeArray(key);
        var values = normalizeArray(incrementBy);

        // Sanity check
        if (values != null && keys.length != values.length) {
            cb(new Error("Length of keys must equal the length of incrementBy values, or incrementBy values can be null."));
            return;
        }

        // Now construct a proper URL formatted key=incrementBy set
        var keyValueSet;
        if (values == null) {
            keyValueSet = keys;
        } else {
            keyValueSet = [];
            for (var i = 0; i < keys.length; i++) {
                keyValueSet.push(keys[i] + "=" + values[i]);
            }
        }

        sendGET($this.serverUrl, "/incr?" + keyValueSet.join("&"), cb);
    },

    /**
     * Decrements a numeric value corresponding to the key(s) passed and returns the new value(s)
     *
     * @param key
     * @param decrementBy - Either an integer value to decrement by (for each KEY if an Array), or null to default to 1
     * @param cb
     */
    decr: function(key, decrementBy, cb) {
        var $this = this;
        $this.log("DECR ["+key+", "+decrementBy+"]");

        // Normalize the keys
        var keys = normalizeArray(key);
        var values = normalizeArray(decrementBy);

        // Sanity check
        if (values != null && keys.length != values.length) {
            cb(new Error("Length of keys must equal the length of decrementBy values, or decrementBy values can be null."));
            return;
        }

        // Now construct a proper URL formatted key=decrementBy set
        var keyValueSet;
        if (values == null) {
            keyValueSet = keys;
        } else {
            keyValueSet = [];
            for (var i = 0; i < keys.length; i++) {
                keyValueSet.push(keys[i] + "=" + values[i]);
            }
        }

        sendGET($this.serverUrl, "/decr?" + keyValueSet.join("&"), cb);
    },

    /**
     * Sets an expire time on a key(s) for timeInMillis from the time the command is received
     * @param key
     * @param timeInMillis
     * @param cb
     */
    expire: function(key, timeInMillis, cb) {
        var $this = this;
        $this.log("EXPIRE ["+key+", "+timeInMillis+"]");

        var keys = normalizeArray(key);
        var expireTimes = normalizeArray(timeInMillis);

        // Sanity check
        if (keys.length != expireTimes.length) {
            cb(new Error("Length of keys must equal the length of timeInMills values."));
            return;
        }

        // Now construct a proper URL formatted key=timeInMillis set
        var keyValueSet = [];
        for (var i = 0; i < keys.length; i++) {
            keyValueSet.push(keys[i] + "=" + expireTimes[i]);
        }

        sendGET($this.serverUrl, "/expire?" + keyValueSet.join("&"), cb);
    },

    /**
     * Returns a RANDOM key from the cache
     * @param cb
     */
    random: function(cb) {
        var $this = this;
        $this.log("RANDOM");

        sendGET($this.serverUrl, "/random", cb);
    },

    /**
     * Returns the RESTCache Stats
     * @param cb
     */
    stats: function(cb) {
        var $this = this;
        $this.log("STATS");

        sendGET($this.serverUrl, "/stats", cb);
    },

    /**
     * Outputs a log message at INFO level if debug is enabled
     * @param message
     */
    log: function(message) {
        if (this.debug) {
            console.log(message);
        }
    }
};


/**
 * Private Helpers
 */

// URL Encodes a String
function encodeString(str) {
    return encodeURIComponent(str);
}

// Returns an encoded array of strings given either an array or an object
function normalizeArray(arr) {
    if (arr == null || typeof arr === 'undefined') {
        return null;
    }

    var normalized = [];

    if (arr instanceof Array) {
        for (var i = 0; i < arr.length; i++) {
            normalized.push(encodeString(arr[i]));
        }
    } else {
        normalized.push(encodeString(arr));
    }

    return normalized;
}

// Performs an HTTP(s) GET request
function sendGET(url, path, cb) {
    request(url + path, function (error, response, body) {
        if (error) {
            cb(error);
        } else {
            cb(null, JSON.parse(body));
        }
    });
}


/**
 * Public
 */
module.exports = RESTCache;