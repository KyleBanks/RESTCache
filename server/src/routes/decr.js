/**
 * DECR
 */

var HttpRoute = require('../HttpRoute');

module.exports = new HttpRoute("/decr", function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var query = req.keyPairs;

    // Retrieve the values for each key
    var decrementedValues = [];
    var errors = [];
    var index = 0;
    for (var key in query) {

        // Get the value to increment by, if it's set
        var decrementBy = query[key];
        if (decrementBy.length == 0) {
            decrementBy = null;
        }

        // Make the call to increment, and check the response for an error message
        var response = cache.decr(key, decrementBy);
        if (response instanceof Error) {
            errors.push(new Error(response.message + " - At Index" + index));
        } else {
            decrementedValues.push(response);
        }

        index ++;
    }

    // Output the responses
    res.json(this.generateOutput(errors, decrementedValues));
});