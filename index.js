/**
 * init
 * Flow module init function
 * @name init
 * @private
 *
 */
exports.init = function (config, ready) {
	var self = this;

	ready();
};

/**
 * pushState
 * push new url state
 *
 * @name pushState
 * @function
 * @param {Object} options Object containig data handler options
 * @param {Object} data An object containing the following fields:
 *
 *  - `url` (String): The new history entry's URL (required).
 *
 * @param {Function} next The next function.
 */
exports.pushState = function (options, data, next) {

	return next(null, data);
};