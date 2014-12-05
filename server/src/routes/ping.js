/**
 * PING
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute('/ping', function(cache, req, res) {
    res.json(this.generateOutput(null, cache.ping()));
});