/**
 * Defines a HTTP(s) route to a given function
 * @param path - ex: /set
 * @param callback - Function accepting a Cache, request, and response object. Must output an HTTP response.
 * @constructor
 */
function HTTPRoute(path, callback) {
    this.path = path;
    this.callback = callback;
}

module.exports = HTTPRoute;