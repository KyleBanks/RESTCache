/**
 * SET
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute("/set", function(cache, req, res) {

    // Pull out the key=value pairs
    var keyValueSets = req.keyPairs;

    // For each one, set it in the cache
    var output = [];
    for (var key in keyValueSets) {
        output.push(cache.set(key, keyValueSets[key]));
    }

    // Output a success message
    res.json(this.generateOutput(null, output));
});