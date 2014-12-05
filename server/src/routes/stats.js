/**
 * STATS
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute('/stats', function(cache, req, res) {
    res.json(this.generateOutput(null, cache.stats()));
});