/**
 * STATS
 */

var HTTPRoute = require('../HTTPRoute');

module.exports = new HTTPRoute('/stats', function(cache, req, res) {
    res.json(cache.stats());
});