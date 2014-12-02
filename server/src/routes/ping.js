/**
 * PING
 */

var HTTPRoute = require('../HTTPRoute');

module.exports = new HTTPRoute('/ping', function(cache, req, res) {
    res.json([cache.ping()]);
});