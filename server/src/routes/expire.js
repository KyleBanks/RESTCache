/**
 * EXPIRE
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');


module.exports = new HttpRoute('/expire', function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var keys = Object.keys(req.keyPairs);

    var output = [],
        errors = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var expireRes = cache.expire(key, req.keyPairs[key]);

        if(expireRes instanceof Error) {
            errors.push(new RCError(expireRes.message, i));
        } else {
            output.push(expireRes);
        }
    }

    res.json(this.generateOutput(errors, output));
});