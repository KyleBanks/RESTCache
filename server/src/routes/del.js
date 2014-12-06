/**
 * DEL
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute("/del", function(cache, req, res) {
    // Iterate over the keys and delete each value
    var keys = Object.keys(req.keyPairs);

    var output = [],
        errors = [];
    for (var i = 0; i < keys.length; i++) {
        var delRes = cache.del(keys[i]);

        if (delRes instanceof Error) {
            errors.push(new RCError(delRes.message, i));
        } else {
            output.push(delRes);
        }
    }

    // Output a success message
    res.json(this.generateOutput(errors, output));
});