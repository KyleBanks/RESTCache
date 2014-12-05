/**
 * KEYS
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute('/keys', function(cache, req, res) {
    res.json(this.generateOutput(null, cache.keys()));
});