/**
 * DECR
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute("/decr", function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var query = req.query;

    // Retrieve the values for each key
    var decrementedValues = [];
    for (var key in query) {

        // Get the value to increment by, if it's set
        var decrementBy = query[key];
        if (decrementBy.length == 0) {
            decrementBy = null;
        }

        // Make the call to increment, and check the response for an error message
        var response = cache.decr(key, decrementBy);
        if (response instanceof Error) {
            response = response.message;
        }

        decrementedValues.push(response);
    }

    // Output the responses
    res.json(decrementedValues);
});