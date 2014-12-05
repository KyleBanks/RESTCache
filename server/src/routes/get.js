/**
 * GET
 */

var HttpRoute = require('../entity/HttpRoute');

module.exports = new HttpRoute("/get", function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var query = req.keyPairs;

    var values = [];
    for (var key in query) {
        values.push(cache.get(key));
    }

    // Output the values
    res.json(this.generateOutput(null, values));
});