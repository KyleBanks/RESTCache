/**
 * Cache.js
 *
 * Internal cache, this is where the magic happens.
 */

/**
 * Imports
 */
var log = require("./misc/log");
var Config = require('../conf/config');
var Package = require('../package.json');

/**
 * Cache Constructor
 * @constructor
 */
function Cache() {
    this.cache = {};
    this.expirePointers = {};
    this.moduleManager = null;

    this.defaultExpiry = Config.cache.defaultExpiry;
    if (isNaN(this.defaultExpiry) || this.defaultExpiry <= 0) {
        this.defaultExpiry = null;
    }
    this.defaultExpireEnabled = (this.defaultExpiry != null);
}

Cache.prototype = {

    /**
     * Returns PONG
     * @returns {string}
     */
    ping: function() {
        log.debug("PING");

        if (! Config.commands.PING) {
            return generateDisabledError("PING");
        }

        return "PONG";
    },

    /**
     * Set a key=value pair in the cache
     * @param key
     * @param value
     */
    set: function(key, value) {
        log.debug("SET: [" + key+"="+value + "]");

        if (! Config.commands.SET) {
            return generateDisabledError("SET");
        }

        return _set.call(this, key, value);
    },

    /**
     * Retrieve the value of a key=value pair from the cache
     * @param key
     */
    get: function(key) {
        log.debug("GET: [" + key + "]");

        if (! Config.commands.GET) {
            return generateDisabledError("GET");
        }

        return _get.call(this, key);
    },

    /**
     * Delete a key=pair from the cache
     * @param key
     */
    del: function(key) {
        log.debug("DEL: [" + key + "]");

        if (! Config.commands.DEL) {
            return generateDisabledError("DEL");
        }

        return _del.call(this, key);
    },

    /**
     * Returns all the keys in the cache
     */
    keys: function() {
        log.debug("KEYS");

        if (! Config.commands.KEYS) {
            return generateDisabledError("KEYS");
        }

        return _keys.call(this);
    },

    /**
     * Increments a numeric value in the cache and returns the new value
     *
     * @param key - The key of the value to increment, if not set, initializes the value to zero and increment
     * @param incrementBy - (Optional: Default 1)
     * @return - Returns either the incremented value, or an Error
     */
    incr: function(key, incrementBy) {
        log.debug("INCR: ["+key+", "+incrementBy+"]");

        if (! Config.commands.INCR) {
            return generateDisabledError("INCR");
        }

        // Ensure a valid incrementBy value has been passed
        incrementBy = getNumericValue(incrementBy, 1, "Invalid value [" + incrementBy + "] to increment by, must be a number.");
        if (incrementBy instanceof Error) {
            return incrementBy;
        }

        // If the cache doesn't contain the KEY, default it to zero
        var cachedValue = _get.call(this, key);
        cachedValue = getNumericValue(cachedValue, 0, "Invalid cached value [" + cachedValue + "] to increment by, must be a number.");
        if (cachedValue instanceof Error) {
            return cachedValue;
        }

        // Increment the value and set it in the cache
        cachedValue += incrementBy;
        if (_set.call(this, key, cachedValue)) {
            return cachedValue;
        } else {
            return new Error("Failed to SET incremented value [" + cachedValue + "] for key: " + key);
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
        log.debug("DECR: ["+key+", "+decrementBy+"]");

        if (! Config.commands.DECR) {
            return generateDisabledError("DECR");
        }

        // Ensure a valid decrementBy value has been passed
        decrementBy = getNumericValue(decrementBy, 1, "Invalid value [" + decrementBy + "] to decrement by, must be a number.");
        if (decrementBy instanceof Error) {
            return decrementBy;
        }

        // If the cache doesn't contain the KEY, default it to zero
        var cachedValue = _get.call(this, key);
        cachedValue = getNumericValue(cachedValue, 0, "Invalid cached value [" + cachedValue + "] to decrement by, must be a number.");
        if (cachedValue instanceof Error) {
            return cachedValue;
        }

        // Decrement the value and set it in the cache
        cachedValue -= decrementBy;
        if (_set.call(this, key, cachedValue)) {
            return cachedValue;
        } else {
            return new Error("Failed to SET decremented value [" + cachedValue + "] for key: " + key);
        }
    },

    /**
     * Expires a key after timeInMillis from now has passed, modifying the existing expire time if set
     *
     * @param key
     * @param timeInMillis
     */
    expire: function(key, timeInMillis) {
        log.debug("EXPIRE: ["+key+", "+timeInMillis+"]");

        if (! Config.commands.EXPIRE) {
            return generateDisabledError("EXPIRE");
        }

        return _expire.call(this, key, timeInMillis);
    },

    /**
     * Removes the expiry time on a key, and sets it to live forever
     * @param key
     */
    unexpire: function(key) {
        log.debug("UNEXPIRE: ["+key+"]");

        if (! Config.commands.UNEXPIRE) {
            return generateDisabledError("UNEXPIRE");
        }

        return _unexpire.call(this, key);
    },

    /**
     * Returns a random key from the cache
     */
    random: function() {
        log.debug("RANDOM");

        if (! Config.commands.RANDOM) {
            return generateDisabledError("RANDOM");
        }

        var cachedKeys = _keys.call(this);
        if (cachedKeys.length > 0) {
            return cachedKeys[getRandomInt(0, cachedKeys.length - 1)];
        } else {
            return null;
        }
    },

    /**
     * Outputs RESTCache stats such as versions, memory usage, etc.
     */
    stats: function() {
        var $this = this;
        log.debug("STATS");

        if(! Config.commands.STATS) {
            return generateDisabledError("STATS");
        }

        // Load the backup keys
        var backups = $this.moduleManager.getBackupManager().getBackups();

        return {
            cache: {
                keyCount: _keys.call($this).length
            },
            memory: {
                heapTotal: process.memoryUsage().heapTotal,
                heapUsed: process.memoryUsage().heapUsed
            },
            system: {
                pid: process.pid,
                platform: process.platform,
                architecture: process.arch
            },
            versions: {
                RESTCache: Package.version,
                node: process.version,
                dependencies: process.versions
            },
            misc: {
                upTime: process.uptime() + "s"
            },
            backups: backups
        };
    },

    /**
     * Triggers a synchronous backup to disk and returns the name of it, if API backup is enabled
     */
    backup: function() {
        var $this = this;
        log.debug("BACKUP");

        if (! Config.commands.BACKUP) {
            return generateDisabledError("BACKUP");
        }

        return $this.moduleManager.getBackupManager().performBackup();
    },

    /**
     * Triggers a synchronous restore of the Cache from the specified backup key. Backup Keys can be retrieved through the STATS command.
     * @param backupKey
     */
    restore: function(backupKey) {
        var $this = this;
        log.debug("RESTORE");

        if (! Config.commands.RESTORE) {
            return generateDisabledError("RESTORE");
        }

        return $this.moduleManager.getBackupManager().restoreBackup(backupKey);
    },

    /**
     * Returns the entire cache, or the contents of the specified backupKey if provided
     * @param backupKey - Optional key to a specific backup to dump
     */
    dump: function(backupKey) {
        var $this = this;
        log.debug("DUMP: ["+backupKey+"]");

        if (! Config.commands.DUMP) {
            return generateDisabledError("DUMP");
        } else {

            // If a backupKey was provided, retrieve that backup's contents
            if (backupKey != null && typeof backupKey !== 'undefined') {
                return $this.moduleManager.getBackupManager().loadBackup(backupKey);
            } else {
                return $this.cache;
            }
        }
    },

    /**
     * Empties the entire cache.
     */
    flush: function() {
        var $this = this;
        log.debug("FLUSH");

        if (! Config.commands.FLUSH) {
            return generateDisabledError("FLUSH");
        } else {
            $this.cache = {};
            return true;
        }
    }
};

/**
 * Public
 * @type {Cache}
 */
module.exports = Cache;

/**
 * Core Internal Methods
 *
 * These must be kept private to allow internal access while maintaining enabled/disabled
 * configurations to external callers.
 */
function _set(key, value) {
    this.cache[key] = value;

    // If default expire time is enabled, and there is no existing expire time set on this key, set the expiry.
    if (this.defaultExpireEnabled && (this.expirePointers[key] == null || this.expirePointers[key] === 'undefined')) {
        _expire.call(this, key, this.defaultExpiry);
    }
    return true;
}

function _get(key) {
    return this.cache[key];
}

function _del(key) {
    // Delete the key/value from the cache
    delete this.cache[key];

    // Delete any expire times set for this key
    delete this.expirePointers[key];

    return true;
}

function _expire(key, timeInMillis) {
    var $this = this;

    // Ensure a valid timeInMillis has been passed
    var errorString = "Invalid timeInMillis passed to EXPIRE: " + timeInMillis;
    timeInMillis = getNumericValue(timeInMillis, new Error(errorString), errorString);
    if (timeInMillis instanceof Error) {
        return timeInMillis;
    }

    // Call UNEXPIRE to wipe any existing expirey time
    _unexpire.call($this, key);

    // Set the new expire time
    this.expirePointers[key] = setTimeout(function() {
        _del.call($this, key);
    }, timeInMillis);

    return true;
}

function _unexpire(key) {
    // Check if there is an existing expire time, and if so, wipe it
    var existingTimeoutPointer = this.expirePointers[key];
    if (existingTimeoutPointer != null && typeof existingTimeoutPointer !== 'undefined') {
        clearTimeout(existingTimeoutPointer);
    }
    delete this.expirePointers[key];

    return true;
}

function _keys() {
    return Object.keys(this.cache);
}


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

function generateDisabledError(commandName) {
    return new Error(commandName + " not enabled.");
}