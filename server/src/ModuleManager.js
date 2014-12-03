/**
 * ModuleManager.js
 *
 * Manages references to global instances of RESTCache modules.
 *
 */

/**
 * Private Variables
 */
var _cache = null,
    _backupManager = null,
    _httpInterface;

/**
 * ModuleManager Constructor
 * @param cache - instance of Cache.js
 * @param backupManager - instance of BackupManager.js
 * @param httpInterface - intance of HttpInterface.js
 * @constructor
 */
function ModuleManager(cache, backupManager, httpInterface) {
    _cache = cache;
    _cache.moduleManager = this;

    _backupManager = backupManager;
    _backupManager.moduleManager = this;

    _httpInterface = httpInterface;
    _httpInterface.moduleManager = this;
}

ModuleManager.prototype = {

    /**
     * Returns the instance of Cache
     * @returns {Cache}
     */
    getCache: function() {
        return _cache;
    },

    /**
     * Returns the instance of BackupManager
     * @returns {BackupManager}
     */
    getBackupManager: function() {
        return _backupManager;
    },

    /**
     * Returns the instance of HttpInterface
     * @returns {HttpInterface}
     */
    getHttpInterface: function() {
        return _httpInterface;
    }

};

/**
 * Public
 */
module.exports = ModuleManager;