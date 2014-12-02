/**
 * RANDOM
 */

var HTTPRoute = require('../HTTPRoute');

module.exports = new HTTPRoute('/random', function(cache, req, res) {
    res.json(cache.random());
});