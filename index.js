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

                        // create event stream
                        var eventStream = self._streams[eventName];
                        if (!eventStream) {
                            eventStream = self.flow(eventName);

                            var handler = function (err) {
                                if (err) {
                                    console.error(err);
                                }
                                delete self._streams[eventName];
                            };

                            // cache stream
                            self._streams[eventName] = eventStream;

                            eventStream.on('error', handler);
                            eventStream.on('end', handler);
                            eventStream.on('data', function nirvana () {});
                        }

                        eventStream.write(data);
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
    var url = data.url || options.url || options._.url;

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
    var url = options._.url || '/';
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

    if (typeof options._ === 'string') {
        data[options._] = state;
        return next(null, data);
    }

    next(null, state);
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