/**
 * Global configuration file for RESTCache.
 */
module.exports = {

    /**
     * HTTP(s) Interface Settings
     */
    http: {

        /*
         The port to run the RESTCache HTTP(s) interface on
         */
        port: 7654
    },

    /**
     * Backup Settings: Configure automatic backups to disk
     */
    backup: {

        /*
         When set to true, automatic backups will be enabled.
         */
        automatic: true,

        /*
         Time interval to write the cache to disk, in milliseconds.
         */
        interval: 1000 * 60,

        /*
         The number of backups to keep. If the backup count exceeds this amount, then the
         oldest backups will be deleted until the number of backups is equal to *count*.
         */
        count: 5,

        /*
         The path (relative to where server.js is run) to the directory in which backups
         should be stored and/or retrieved.
         */
        directory: "./out",

        /*
         When set the true, the cache will be initialized to the most recent backup on startup.
         */
        loadOnStartup: true,

        /*
         When set to true, the BACKUP action will be enabled (/backup)
         */
        apiBackupEnabled: false,

        /*
         When set to true, the RESTORE action will be enabled (/restore)
         */
        apiRestoreEnabled: false
    },

    /**
     * Extension Settings
     */
    extensions: {

        /*
         When set to true, extensions will be loaded and available
         */
        enabled: true,

        /*
         The path (relative to where server.js is run) to the directory in which extensions
         should loaded.
         */
        directory: "./extensions"
    },

    /**
     * Miscellaneous Settings
     */
    misc: {

        /*
         When set to true, the cache will output log messages for all actions to console.log
         */
        debug: true
    }
};