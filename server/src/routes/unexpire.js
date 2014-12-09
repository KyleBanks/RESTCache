/**
 * UNEXPIRE
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');


module.exports = new HttpRoute('/unexpire', function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var keys = Object.keys(req.keyPairs);

    var output = [],
        errors = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var unexpireRes = cache.unexpire(key);

        if(unexpireRes instanceof Error) {
            errors.push(new RCError(unexpireRes.message, i));
        } else {
            output.push(unexpireRes);
        }
    }

    res.json(this.generateOutput(errors, output));
});