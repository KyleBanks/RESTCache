/**
 * PING
 */

var HttpRoute = require('../entity/HttpRoute');

module.exports = new HttpRoute('/ping', function(cache, req, res) {
    res.json(this.generateOutput(null, cache.ping()));
});