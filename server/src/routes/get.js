/**
 * GET
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute("/get", function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var keys = Object.keys(req.keyPairs);

    var values = [],
        errors = [];
    for (var i = 0 ; i < keys.length; i++) {
        var output = cache.get(keys[i]);

        if (output instanceof Error) {
            errors.push(new RCError(output.message, i));
        } else {
            values.push(output);
        }
    }

    // Output the values
    res.json(this.generateOutput(errors, values));
});