/**
 * KEYS
 */

var HttpRoute = require('../entity/HttpRoute');

module.exports = new HttpRoute('/keys', function(cache, req, res) {
    res.json(this.generateOutput(null, cache.keys()));
});