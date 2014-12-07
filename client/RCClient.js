/**
 * RCClient.js
 *
 * RESTCache Node.js client interface
 */

/**
 * Imports
 */
var request = require("request");


/**
 * Static Variables
 */
var MODE_POST = "POST",
    MODE_GET = "GET";

/**
 * Constructs a new RCClient client
 * @param host In the format of protocol://hostname:port (ex. http://localhost:7654)
 * @param options
 *      - debug: Set true to output debug logs to the console
 *      - mode: "GET" or "POST", defaults to "POST"
 * @constructor
 */
function RCClient(host, options) {
    // Ensure the host doesn't end in '/'
    if (host.substr(-1) === "/") {
        host = host.substring(0, host.length - 2);
    }
    this.serverUrl = host;

    // Pull out the options, with defaults
    this.debug = false;
    if (options.debug != null && options.debug !== 'undefined') {
        this.debug = options.debug;
    }

    this.mode = MODE_POST;
    if (options.mode != null && options.mode !== 'undefined') {
        if (options.mode === MODE_GET || options.mode === MODE_POST) {
            this.mode = options.mode;
        } else {
            throw new Error("Unknown RCClient Mode: " + options.mode);
        }
    }

    this.log("RCClient initialized with host " + this.serverUrl);
}

RCClient.prototype = {

    /**
     * Attempts to verify connection to the cache by sending a PING request
     * @param cb
     */
    ping: function(cb) {
        var $this = this;
        $this.log("PING");

        $this.sendRequest("/ping", null, null, cb);
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

        $this.sendRequest("/set", keys, values, cb);
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

        $this.sendRequest("/get", keys, null, cb);
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

        $this.sendRequest("/del", keys, null, cb);
    },

    /**
     * Returns all of the keys from the cache
     * @param cb
     */
    keys: function(cb) {
        var $this = this;
        $this.log("KEYS");

        $this.sendRequest("/keys", null, null, cb);
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

        $this.sendRequest("/incr", keys, values, cb);
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

        $this.sendRequest("/decr", keys, values, cb);
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

        $this.sendRequest("/expire", keys, expireTimes, cb);
    },

    /**
     * Returns a RANDOM key from the cache
     * @param cb
     */
    random: function(cb) {
        var $this = this;
        $this.log("RANDOM");

        $this.sendRequest("/random", null, null, cb);
    },

    /**
     * Returns the RESTCache Stats
     * @param cb
     */
    stats: function(cb) {
        var $this = this;
        $this.log("STATS");

        $this.sendRequest("/stats", null, null, cb);
    },

    /**
     * Performs a backup and returns the name of the backup
     * @param cb
     */
    backup: function(cb) {
        var $this = this;
        $this.log("BACKUP");

        $this.sendRequest("/backup", null, null, cb);
    },

    /**
     * Performs a restore of the cache to the specified backup key. Backup keys are available via the STATS command.
     * @param backupKey
     * @param cb
     */
    restore: function(backupKey, cb) {
        var $this = this;
        $this.log("RESTORE");

        $this.sendRequest("/random", [backupKey], null, cb);
    },

    /**
     * Performs a DUMP of the cache, with the optional backupKey if you wish to receive a dump of a specific backup
     * @param backupKey [Optional: Pass null to retrieve a dump of the current cache]
     * @param cb
     */
    dump: function(backupKey, cb) {
        var $this = this;
        $this.log("DUMP ["+backupKey+"]");

        if (backupKey == null || typeof backupKey === 'undefined') {
            $this.sendRequest("/dump", null, null, cb);
        } else {
            $this.sendRequest("/dump", [backupKey], null, cb);
        }
    },



    /**
     * Sends an HTTP request (GET or POST) to the RESTCache server, with an Array of key=value pairs.
     *
     * The key/value arrays can both be null, or values can be null, or neither can be null.
     * If neither are null, they must be the same length.
     *
     * @param path - URI to request (ex: /get?key=val)
     * @param keys - An array of URL Encoded keys (Optional)
     * @param values - An array of URL Encoded values (Optional)
     * @param cb - Callback to execute (Accepts Error, Response)
     */
    sendRequest: function(path, keys, values, cb) {
        var $this = this;
        var url = $this.serverUrl + path;

        var keysExist = (keys != null && keys !== 'undefined'),
            valuesExist = (values != null && values !== 'undefined');

        switch ($this.mode) {

            // HTTP GET
            case MODE_GET:
                // Check if there are key=value pairs to send out
                if (keysExist) {

                    // Construct the key=value pairs and append to the URL
                    var keyPairs = [];
                    for (var i = 0; i < keys.length; i++) {
                        if (valuesExist) {
                            keyPairs.push(encodeString(keys[i])+'='+encodeString(values[i]));
                        } else {
                            keyPairs.push(encodeString(keys[i]));
                        }
                    }
                    url = url + "?" + keyPairs.join("&");
                }

                request.get(url, function (error, response, body) {
                    if (error) {
                        cb([error]);
                    } else {
                        var res = JSON.parse(body);
                        cb(res.errors, res.response);
                    }
                });
                break;

            // HTTP POST
            case MODE_POST:
                // Check if there are any key=value pairs to send out
                var postData = {};
                if (keysExist) {
                    for (var i = 0; i < keys.length; i++) {
                        if (valuesExist) {
                            postData[keys[i]] = values[i];
                        } else {
                            postData[keys[i]] = null;
                        }
                    }
                }

                request.post(url, {form: postData}, function(error, response, body) {
                    if (error) {
                        cb([error]);
                    } else {
                        var res = JSON.parse(body);
                        cb(res.errors, res.response);
                    }
                });
                break;
        }
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
            normalized.push(arr[i]);
        }
    } else {
        normalized.push(arr);
    }

    return normalized;
}

/**
 * Public
 */
module.exports = RCClient;