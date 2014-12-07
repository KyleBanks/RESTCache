/**
 * BACKUP
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute('/backup', function(cache, req, res) {
    var output = cache.backup();

    if (output instanceof Error) {
        res.json(this.generateOutput(new RCError(output.message, 0), null));
    } else {
        res.json(this.generateOutput(null, output));
    }
});