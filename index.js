/**
 * init
 * Flow module init function
 * @name init
 * @private
 *
 */
exports.init = function (config, ready) {
    var self = this;

    // init streams
    self._streams = self._streams || {};

    if (config.events) {

        Object.keys(config.events).forEach(function (eventName) {
            config.events[eventName].forEach(function (elm) {
                if (global.addEventListener) {
                    global.addEventListener(elm.on, function (event) {
                        var data = {};

                        // handle popstate events
                        if (event.type === 'popstate') {
                            data.url = global.location.pathname;
                        }

                        self.flow(eventName).write(data);
                    });
                }
            });
        });
    }

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
    var url = data.url || options.url;

    if (!url) {
        return next(null, data);
    }

    // update history if url is different
    if (global.location && url !== global.location.pathname) {
        global.history.pushState(0, 0, url);
    }

    return next(null, data);
};

/**
 * reload
 * reloads url
 *
 * @name reload
 * @function
 * @param {Object} options Object containig data handler options
 * @param {Object} data An object containing the following fields:
 *
 *  - `url` (String): The new url(required).
 *
 * @param {Function} next The next function.
 */
exports.reload = function (options, data, next) {
    var url = options.url || '/';
    global.location.replace(url);
};

/**
 * state
 * get url state
 *
 * @name pushState
 * @function
 * @param {Object} options Object containig data handler options
 * @param {Object} data An object containing the following fields:
 *
 * @param {Function} next The next function.
 */
exports.state = function (options, data, next) {

    /*
        TODO create docs
        config example
        "targetKey"
    */

    // extend data with location data (hash, search, path)
    if (!location) {
        return next(new Error('Flow-url.state: No browser environment.'));
    }

    var state = handleStateValues();

    if (typeof options === 'string') {
        data[options] = state;
        return next(null, data);
    }

    next(null, state);
};

/**
 * returns querystring param
 *
 * @name getQsParam
 * @function
 * @param {Object} options Object containig data handler options
 * @param {Object} data An object containing the following fields:
 *
 * @param {Function} next The next function.
 */
exports.getQsParam = function (options, data, next) {

    var pathname = (typeof location !== 'undefined' ) ? location.pathname : data.url || (data.req.url || '');

    if (!options.params || (typeof options.params !== 'string' && !(options.params instanceof Array))) {
        return next(new Error('Flow-url.getQsParam: Invalid param name.'), data);
    }

    var params = options.params;
    if (typeof params === 'string') {
        params = [params];
    }

    var target = data;
    if (options.target) {
        var splits = options.target.split('.');

        splits.forEach(function (key) {
            if (!target[key]) {
                target[key] = {};
            }
            target = target[key];
        });
    }

    params.forEach(function (name) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(pathname);

        if (!results) {
            target[name] = null;
            return;
        };
        if (!results[2]) {
            target[name] = '';
            return;
        }

        target[name] = decodeURIComponent(results[2].replace(/\+/g, " "));
    });

    next(null, data);
};


/**
 * Extend event object with location data.
 *
 * @private
 * @param {object} The event object.
 */
function handleStateValues () {

    var state = {
        url: location.pathname,
        path: location.pathname.substr(1).split('/')
    };

    // parse and append url search to data
    if (location.search) {
        state.search = searchToJSON(location.search);
    }

    // append url hash to data
    if (location.hash) {
        state.hash = location.hash.substr(1);
    }

    return state;
}

/**
 * Parse a state search string to JSON.
 * Credentials: http://snipplr.com/view/70905/search-string-to-json/
 *
 * @private
 */
function searchToJSON(search) {
    var rep = {'?':'{"','=':'":"','&':'","'};
    var s = search.replace(/[\?\=\&]/g, function(r) {
        return rep[r];
    });
    return JSON.parse(s.length? s+'"}' : "{}");
}
