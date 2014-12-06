/**
 * DUMP
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute('/dump', function(cache, req, res) {

    // Get the key
    var keys = Object.keys(req.keyPairs);

    var errors = null,
        response = null;

    // Validate that only 1 key was supplied
    if (keys.length > 1) {
        errors = new RCError("Invalid number of keys for DUMP ["+keys.length+"]. DUMP requires 0 or 1 key.", 0);
    } else {
        // Perform the DUMP
        var dumpRes = cache.dump(keys.length == 0 ? null : keys[0]);

        // Check the response
        if (dumpRes instanceof Error) {
            errors = new RCError(dumpRes.message, 0);
        } else {
            response = dumpRes;
        }
    }

    res.json(this.generateOutput(errors, response));
});