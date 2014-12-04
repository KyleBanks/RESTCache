/**
 * merge-params.js
 *
 * Express.js middleware that merges GET, POST, and Express.js PATH (ie. /get/:name) parameters into one map.
 *
 * The parameters are prioritized in the order of PATH > POST > GET, meaning a duplicate
 * param in PATH, POST, and GET will end up with the PATH param.
 *
 */


module.exports = function(req, res, next) {
    var allParams = {};

    // GET First
    mergeObjects(allParams, req.query);

    // Now POST
    mergeObjects(allParams, req.body);

    // Now PATH Params
    mergeObjects(allParams, req.params);

    req.keyPairs = allParams;
    next();
};


/**
 * Merges one object into another, overwriting any existing duplicate keys.
 *
 * @param intoObject
 * @param fromObject
 */
function mergeObjects(intoObject, fromObject) {
    if (fromObject != null && fromObject !== 'undefined') {
        for (var key in fromObject) {
            intoObject[key] = fromObject[key];
        }
    }
}