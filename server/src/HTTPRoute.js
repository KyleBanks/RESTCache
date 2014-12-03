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
    equals: function(otherRoute) {
        return this.path === otherRoute.path;
    }
};

module.exports = HttpRoute;