/**
 * RANDOM
 */

var HttpRoute = require('../entity/HttpRoute');

module.exports = new HttpRoute('/random', function(cache, req, res) {
    res.json(this.generateOutput(null, cache.random()));
});