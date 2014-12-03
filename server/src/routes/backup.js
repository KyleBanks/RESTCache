/**
 * BACKUP
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute('/backup', function(cache, req, res) {
    cache.backup(function(err, backupRes) {
        if (err) {
            res.json([err.message]);
        } else {
            res.json(backupRes);
        }
    });
});