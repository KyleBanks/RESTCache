/**
 * BACKUP
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute('/backup', function(cache, req, res) {
    var $this = this;

    cache.backup(function(err, backupRes) {
        console.log(err);
        res.json($this.generateOutput(err, backupRes));
    });
});