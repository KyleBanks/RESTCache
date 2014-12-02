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
    if (host.substr(-1) === "/") {
        host = host.substring(0, host.length - 2);
    }

    this.serverUrl = host;
    this.debug = debug;

    this.log("RESTCache initialized with host " + this.serverUrl);
}
module.exports = RESTCache;

RESTCache.prototype = {

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
        keyValueSet = keyValueSet.join("&");

        sendGET($this.serverUrl, "/set?"+keyValueSet, cb);
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

        // Now construct a proper URL formatted key=value set
        keys = keys.join("&");

        sendGET($this.serverUrl, "/get?"+keys, cb);
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

        // Now construct a proper URL formatted key=value set
        keys = keys.join("&");

        sendGET($this.serverUrl, "/del?"+keys, cb);
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

/**
 * Performs an HTTP(s) GET
 * @param url
 * @param path
 * @param cb
 */
function sendGET(url, path, cb) {
    var $this = this;

    request(url + path, function (error, response, body) {
        if (error) {
            cb(error);
        } else {
            cb(null, JSON.parse(body));
        }
    });
}