/**
 * INCR
 */

var HttpRoute = require('../entity/HttpRoute');
var RCError = require('../entity/RCError');

module.exports = new HttpRoute("/incr", function(cache, req, res) {
    // Iterate over the keys and pull out each value
    var query = req.keyPairs;

    // Retrieve the values for each key
    var incrementedValues = [];
    var errors = [];
    var index = 0;
    for (var key in query) {

        // Get the value to increment by, if it's set
        var incrementBy = query[key];
        if (incrementBy.length == 0) {
            incrementBy = null;
        }

        // Make the call to increment, and check the response for an error message
        var response = cache.incr(key, incrementBy);
        if (response instanceof Error) {
            errors.push(new RCError(response.message, index));
        } else {
            incrementedValues.push(response);
        }

        index ++;
    }

    // Output the responses
    console.log(errors);
    res.json(this.generateOutput(errors, incrementedValues));
});