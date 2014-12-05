/**
 * RESTORE
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute('/restore', function(cache, req, res) {

    // Get the key
    var keys = Object.keys(req.keyPairs);

    // Validate that only 1 key was supplied
    if (keys.length != 1) {
        res.json(["ERROR: RESTORE takes exactly 1 key."]);
    } else {
        // Perform the RESTORE
        var restoreRes = cache.restore(keys[0]);

        // Check the response
        if (restoreRes instanceof Error) {
            res.json(this.generateOutput(restoreRes, null));
        } else {
            res.json(this.generateOutput(null, restoreRes));
        }
    }
});