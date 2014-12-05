/**
 * BACKUP
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute('/backup', function(cache, req, res) {
    var $this = this;

    cache.backup(function(err, backupRes) {
        if(err) {
            err = new RCError(err.message, 0);
        }

        res.json($this.generateOutput(err, backupRes));
    });
});