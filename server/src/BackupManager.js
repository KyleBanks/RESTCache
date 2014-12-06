/**
 * BackupManager.js
 *
 * Manages the automatic and action-based backups of the cache to disk.
 */

/**
 * Imports
 */
var log = require('./misc/log');
var fs = require('fs');
var Backup = require('./entity/Backup');

/**
 * Globals
 */
var BACKUP_FILE_EXTENSION = ".rc.bak";

/**
 * BackupManager Constructor
 * @param config - The value of 'backup' in the global configuration
 * @constructor
 */
function BackupManager(config) {
    log.debug("Constructing BackupManager w/ Configuration: ");
    log.debug(config);

    this.moduleManager = null;

    // Load the configs
    this.automatic = config.automatic;
    this.interval = config.interval;
    this.count = config.count;
    this.directory = config.directory;
    this.loadOnStartup = config.loadOnStartup;
}

BackupManager.prototype = {

    /**
     * Performs BackupManager initialization
     */
    initialize: function() {

        // Sanitize the directory, ensure it doesn't end in /
        if (this.directory.lastIndexOf("/") == this.directory.length - 2) {
            this.directory = this.directory.substring(0, this.directory.length - 2);
        }

        // Ensure the backup directory exists
        if (! fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory);
        }

        // If loadOnStartup is set, attempt to load the most recent backup into the cache
        if (this.loadOnStartup) {

            // Load the backups and retrieve the newest one
            var backups = this.getBackups();
            if (backups != null && backups.length > 0) {
                this.restoreBackup(backups[0].key);
            }
        }

        // Start the interval for backups if automatic backups are enabled
        if (this.automatic) {
            setInterval(this.performBackup.bind(this), this.interval);
        }
    },

    /**
     * Performs a full disk-based backup of the cache
     * @param cb - Callback to execute when the backup is complete. Accepts an error object and the name of the new backup (String)
     */
    performBackup: function(cb) {
        log.debug("Performing cache backup...");
        var $this = this;

        // Generate a unique name for the new backup
        var dateStr = new Date().toISOString()
            .replace(/T/, ' ')
            .replace(/\./, ':')
            .replace(/ /g, '_')
            .replace(/\//, ':');
        var backupName = dateStr + BACKUP_FILE_EXTENSION;

        // Load the cache into a String
        var cacheMemory = JSON.stringify($this.moduleManager.getCache().cache);

        // Write the cache to disk
        fs.writeFile(this.directory + "/" + backupName, cacheMemory, function(err) {
            if(err) {
                log.error("An error occurred during cache backup: " + backupName);
                log.error(err);
            } else {
                log.debug("New backup created: " + backupName);
            }

            // Execute the callback, if set
            if (cb != null && typeof cb !== 'undefined') {
                cb(err, backupName);
            }

            // Run the cleanup
            $this.cleanExcessBackups(null);
        });
    },

    /**
     * Removes backups, oldest first, in excess of this.count
     * @param cb - Callback to be executed when the cleanup is complete. Accepts an error object and a list of remaining Backup objects (Array)
     */
    cleanExcessBackups: function(cb) {
        var $this = this;

        // Load the existing backups, and check how many (if any) need to be removed
        var existingBackups = $this.getBackups();
        var backupsToRemove = existingBackups.length - $this.count < 0 ?
            0 : existingBackups.length - $this.count;

        log.debug("Found " + existingBackups.length + " existing backups, removing: " + backupsToRemove);

        // Remove the oldest files first
        for (var i = 0; i < existingBackups.length; i++) {
            // Check that we've passed the number of files to keep.
            if (i < $this.count) {
                continue;
            }

            console.log("Removing: " + existingBackups[i].key);
            fs.unlinkSync($this.directory + "/" + existingBackups[i].key);
        }

        // Execute the callback, if set
        if (cb != null && typeof cb !== 'undefined') {
            cb(err, $this.getBackups());
        }
    },

    /**
     * Returns an array of Backup objects, sorted by the last modified time
     */
    getBackups: function() {
        var $this = this;

        // Iterate over the backup directory and find files with the backup file extension
        var fileList = fs.readdirSync($this.directory);
        var backups = [];
        for (var i = 0; i < fileList.length; i++) {
            var backup = fileList[i];
            if (backup.lastIndexOf(BACKUP_FILE_EXTENSION) > 0 &&
                backup.lastIndexOf(BACKUP_FILE_EXTENSION) == backup.length - BACKUP_FILE_EXTENSION.length) {

                // Construct a new Backup object to represent the Cache backup
                backups.push(
                    new Backup(
                        backup,
                        fs.statSync($this.directory + "/" + backup).mtime.getTime()
                    )
                );
            }
        }

        // Sort the backups
        backups.sort(function(a, b) {
            return a.compare(b);
        });

        return backups;
    },

    /**
     * Returns the JSON contents of the specified backup
     * @param backupName - The name of the backup to load
     */
    loadBackup: function(backupName) {
        var $this = this;
        log.debug("Loading Backup: " + backupName);

        try {
            // Load the file into memory
            var backupPath = $this.directory + '/' + backupName;
            var data = fs.readFileSync(backupPath, { encoding: 'utf8' });

            // Parse the file as JSON, and return
            return JSON.parse(data);
        } catch (error) {
            log.error("Unable to load backup: " + error.message);
            log.error(error);
            return new Error("Unable to load backup " + backupName);
        }

    },

    /**
     * Restores the cache to the specified backup, overwriting any data existing in the cache.
     * @param backupName - The name of the backup to load
     * @return - Either true if the backup restore was successful, or an Error
     */
    restoreBackup: function(backupName) {
        var $this = this;
        log.force("Cache being restored from Backup: " + backupName);

        // Load the backup into memory, and overwrite the existing cache
        var backup = $this.loadBackup(backupName);

        // Check for errors
        if (backup instanceof Error) {
            log.error(backup.message);
            return backup;
        } else {
            $this.moduleManager.getCache().cache = backup;

            log.force("Cache restored from Backup: " + backupName);
            return true;
        }
    }
};

/**
 * Public
 * @type {BackupManager}
 */
module.exports = BackupManager;