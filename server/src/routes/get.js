/**
 * GET
 */

var HTTPRoute = require('../HTTPRoute');

module.exports = new HTTPRoute("/get", function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var query = req.query;

    var values = [];
    for (var key in query) {
        values.push(cache.get(key));
    }

    // Output the values
    res.json(values);
});