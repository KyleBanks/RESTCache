/**
 * SET
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute("/set", function(cache, req, res) {

    // Pull out the key=value pairs
    var keyValueSets = Object.keys(req.keyPairs);

    // For each one, set it in the cache
    var errors = [],
        output = [];
    for (var i = 0 ; i < keyValueSets.length; i++) {
        var key = keyValueSets[i];
        var setRes = cache.set(key, req.keyPairs[key]);

        if (setRes instanceof Error) {
            errors.push(new RCError(setRes.message, i));
        } else {
            output.push(setRes);
        }
    }

    // Output a success message
    res.json(this.generateOutput(errors, output));
});