/**
 * DEL
 */

var HTTPRoute = require('../HTTPRoute');

module.exports = new HTTPRoute("/del", function(cache, req, res) {
    // Iterate over the keys and delete each value
    var query = req.query;

    var output = [];
    for (var key in query) {
        output.push(cache.del(key));
    }

    // Output a success message
    res.json(output);
});