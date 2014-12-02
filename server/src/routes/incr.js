/**
 * INCR
 */

var HTTPRoute = require('../HTTPRoute');

module.exports = new HTTPRoute("/incr", function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var query = req.query;

    // Retrieve the values for each key
    var incrementedValues = [];
    for (var key in query) {

        // Get the value to increment by, if it's set
        var incrementBy = query[key];
        if (incrementBy.length == 0) {
            incrementBy = null;
        }

        // Make the call to increment, and check the response for an error message
        var response = cache.incr(key, incrementBy);
        if (response instanceof Error) {
            response = response.message;
        }

        incrementedValues.push(response);
    }

    // Output the responses
    res.json(incrementedValues);
});