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