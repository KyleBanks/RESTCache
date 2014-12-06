/**
 * HttpRoute.js
 *
 * Implemented in order to provide HTTP(s) access to custom cache actions.
 *
 */

/**
 * HttpRoute Constructor
 * @param path - String ex: '/set'
 * @param callback - Function accepting a Cache, request, and response object. Must output an HTTP response.
 * @constructor
 */
function HttpRoute(path, callback) {
    this.path = path;
    this.callback = callback;
}

HttpRoute.prototype = {

    /**
     * Generates a standard output format.
     *
     * @param errors - Array of RCError objects, or null if there were no errors
     * @param response - Array of responses, or a single response object in JSON Object format.
     *
     * Non-Array types (and non-Objects for response) will be converted into arrays of length 1.
     */
    generateOutput: function(errors, response) {
        var output = {
            errors: null,
            response: null
        };

        // Normalize errors
        if (errors != null && typeof errors !== 'undefined') {
            if (! (errors instanceof Array)) {
                errors = [ errors ];
            }
        } else {
            errors = [];
        }

        // Convert error objects into JSON representations
        var errorMessages = [];
        for (var i = 0; i < errors.length; i++) {
            var error = errors[i];
            errorMessages.push(error);
        }
        output.errors = errorMessages;

        // Normalize response
        if (response != null && typeof response !== 'undefined') {
            if (! (response instanceof Array)) {
                response = [response];
            }
        } else {
            response = [];
        }
        output.response = response;

        return output;
    },

    /**
     * Compare to routes for equality based on the path they provide (i.e. /get == /get)
     * @param otherRoute
     * @returns {boolean}
     */
    equals: function(otherRoute) {
        return this.path === otherRoute.path;
    }
};

module.exports = HttpRoute;