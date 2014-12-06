/**
 * Backup.js
 * Represents a Cache backup
 */

/**
 * Backup Constructor
 * @param key - The backup KEY
 * @param lastModified - Time in milliseconds when the backup was last modified
 * @constructor
 */
function Backup(key, lastModified) {
    this.key = key;
    this.lastModified = lastModified;
}

Backup.prototype = {

    /**
     * Compare function used for sorting by lastModified
     * @param otherBackup
     * @returns {number}
     */
    compare: function(otherBackup) {
        if (this.lastModified < otherBackup.lastModified)
            return 1;
        if (this.lastModified > otherBackup.lastModified)
            return -1;
        return 0;
    }

};

/**
 * Public
 * @type {Backup}
 */
module.exports = Backup;