/**
 * DEL
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute("/del", function(cache, req, res) {
    // Iterate over the keys and delete each value
    var query = req.query;

    var output = [];
    for (var key in query) {
        output.push(cache.del(key));
    }

    // Output a success message
    res.json(output);
});