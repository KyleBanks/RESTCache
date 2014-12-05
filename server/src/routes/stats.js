/**
 * STATS
 */

var HttpRoute = require('../entity/HttpRoute');

module.exports = new HttpRoute('/stats', function(cache, req, res) {
    res.json(this.generateOutput(null, cache.stats()));
});