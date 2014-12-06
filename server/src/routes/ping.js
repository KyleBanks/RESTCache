/**
 * PING
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute('/ping', function(cache, req, res) {
    var output = cache.ping();

    if (output instanceof Error) {
        res.json(this.generateOutput(null, new RCError(output.message, 0)));
    } else {
        res.json(this.generateOutput(null, output));
    }
});