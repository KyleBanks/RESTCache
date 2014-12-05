/**
 * RESTORE
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute('/restore', function(cache, req, res) {

    // Get the key
    var keys = Object.keys(req.keyPairs);


    var errors = null,
        response = null;
    // Validate that only 1 key was supplied
    if (keys.length != 1) {
        errors = new RCError("RESTORE requires exactly one key.", 0);
    } else {
        // Perform the RESTORE
        var restoreRes = cache.restore(keys[0]);

        // Check the response
        if (restoreRes instanceof Error) {
            errors = new RCError(restoreRes.message, 0);
        } else {
            response = restoreRes;
        }
    }

    res.json(this.generateOutput(errors, response));
});