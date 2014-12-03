/**
 * EXPIRE
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute('/expire', function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var query = req.query;

    var output = [];
    for (var key in query) {
        output.push(cache.expire(key, query[key]));
    }

    res.json(output);
});