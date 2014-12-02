/**
 * KEYS
 */

var HTTPRoute = require('../HTTPRoute');

module.exports = new HTTPRoute('/keys', function(cache, req, res) {
    res.json(cache.keys());
});