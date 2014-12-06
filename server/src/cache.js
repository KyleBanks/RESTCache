/**
 * Cache.js
 *
 * Internal cache, this is where the magic happens.
 */

/**
 * Imports
 */
var log = require("./misc/log");
var Config = require('../conf/Config');

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
        return "PONG";
    },

    /**
     * Set a key=value pair in the cache
     * @param key
     * @param value
     */
    set: function(key, value) {
        log.debug("SET: [" + key+"="+value + "]");

        this.cache[key] = value;

        // If default expire time is enabled, and there is no existing expire time set on this key, set the expiry.
        if (this.defaultExpireEnabled && (this.expirePointers[key] == null || this.expirePointers[key] === 'undefined')) {
            this.expire(key, this.defaultExpiry);
        }
        return true;
    },

    /**
     * Retrieve the value of a key=value pair from the cache
     * @param key
     */
    get: function(key) {
        log.debug("GET: [" + key + "]");

        return this.cache[key];
    },

    /**
     * Delete a key=pair from the cache
     * @param key
     */
    del: function(key) {
        log.debug("DEL: [" + key + "]");

        // Delete the key/value from the cache
        delete this.cache[key];

        // Delete any expire times set for this key
        delete this.expirePointers[key];

        return true;
    },

    /**
     * Returns all the keys in the cache
     */
    keys: function() {
        log.debug("KEYS");

        return Object.keys(this.cache);
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

        // Ensure a valid incrementBy value has been passed
        incrementBy = getNumericValue(incrementBy, 1, "Invalid value [" + incrementBy + "] to increment by, must be a number.");
        if (incrementBy instanceof Error) {
            return incrementBy;
        }

        // If the cache doesn't contain the KEY, default it to zero
        var cachedValue = this.get(key);
        cachedValue = getNumericValue(this.get(key), 0, "Invalid cached value [" + cachedValue + "] to increment by, must be a number.");
        if (cachedValue instanceof Error) {
            return cachedValue;
        }

        // Increment the value and set it in the cache
        cachedValue += incrementBy;
        if (this.set(key, cachedValue)) {
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

        // Ensure a valid decrementBy value has been passed
        decrementBy = getNumericValue(decrementBy, 1, "Invalid value [" + decrementBy + "] to decrement by, must be a number.");
        if (decrementBy instanceof Error) {
            return decrementBy;
        }

        // If the cache doesn't contain the KEY, default it to zero
        var cachedValue = this.get(key);
        cachedValue = getNumericValue(this.get(key), 0, "Invalid cached value [" + cachedValue + "] to decrement by, must be a number.");
        if (cachedValue instanceof Error) {
            return cachedValue;
        }

        // Decrement the value and set it in the cache
        cachedValue -= decrementBy;
        if (this.set(key, cachedValue)) {
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

        // Ensure a valid timeInMillis has been passed
        var errorString = "Invalid timeInMillis passed to EXPIRE: " + timeInMillis;
        timeInMillis = getNumericValue(timeInMillis, new Error(errorString), errorString);
        if (timeInMillis instanceof Error) {
            return timeInMillis;
        }

        // Check if there is an existing expire time, and if so, wipe it
        var existingTimeoutPointer = this.expirePointers[key];
        if (existingTimeoutPointer != null && typeof existingTimeoutPointer !== 'undefined') {
            clearTimeout(existingTimeoutPointer);
        }

        // Set the new expire time
        var $this = this;
        this.expirePointers[key] = setTimeout(function() {
            $this.del(key);
        }, timeInMillis);

        return true;
    },

    /**
     * Returns a random key from the cache
     */
    random: function() {
        log.debug("RANDOM");

        var cachedKeys = Object.keys(this.cache);
        if (cachedKeys.length > 0) {
            var indexOfRandomKey = getRandomInt(0, cachedKeys.length);
            return cachedKeys[indexOfRandomKey];
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

        var backups = [];
        if ($this.moduleManager.getBackupManager() != null && typeof $this.moduleManager.getBackupManager() !== 'undefined') {
            var backupObjs = $this.moduleManager.getBackupManager().getBackups();
            backupObjs.forEach(function(backup) {
                backups.push(backup.toJSON());
            });
        }

        return {
            cache: {
                keyCount: Object.keys(this.cache).length
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
     * Triggers a backup and returns the name of it, if API backup is enabled
     */
    backup: function(cb) {
        var $this = this;
        log.debug("BACKUP");

        if (! Config.backup.apiBackupEnabled) {
            cb(new Error("API Backup is not enabled."));
        } else {
            $this.moduleManager.getBackupManager().performBackup(function(err, res) {
                if (err) {
                    return cb(err);
                } else {
                    return cb(null, [res]);
                }
            });
        }
    },

    /**
     * Triggers a restore of the Cache to the specified backup, available via STATS
     * @param backupKey
     */
    restore: function(backupKey) {
        var $this = this;
        log.debug("RESTORE");

        if (! Config.backup.apiRestoreEnabled) {
            return new Error("API Restore is not enabled.");
        } else {
            return $this.moduleManager.getBackupManager().restoreBackup(backupKey);
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