;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['q'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('q'));
  } else {
    root.NohupWebSocket = factory(root.Q);
  }
}(this, function(Q) {
var _beyondMaxWaitTime = false,
    _runTimeout;

function Karn(options) {
    var _options = {
        maxWaitTime: 30,
        run: function() {
            this.execute();
        },
        base: 2,
        exponential: 0
    };
    if (options && typeof options === 'object') {
        if ((Number(options.base) == options.base) && (options.base > 0)) {
            _options.base = options.base;
        }
        if ((Number(options.exponential) == options.exponential) && (options.exponential > 0)) {
            _options.exponential = options.exponential;
        }
        if ((Number(options.maxWaitTime) == options.maxWaitTime) && (options.maxWaitTime > 0)) {
            _options.maxWaitTime = options.maxWaitTime;
        }
        if (typeof options.run === 'function') {
            _options.run = options.run;
        }
    }
    for (var k in _options) {
        this[k] = _options[k];
    }
}

/**
 *  @TODO reset
 */
Karn.prototype.reset = function() {
    this.exponential = 0;
    _beyondMaxWaitTime = false;
};

Karn.prototype.execute = (function() {
    var getWaitTime = function(base, exponential, maxWaitTime) {
        var _currentWaitTime;
        if (!_beyondMaxWaitTime) {
            _currentWaitTime = Math.pow(base, exponential);
        } else {
            return maxWaitTime;
        }
        if (_currentWaitTime >= maxWaitTime) {
            _currentWaitTime = maxWaitTime;
            _beyondMaxWaitTime = true;
        }
        return _currentWaitTime;
    };

    return function() {
        var self = this;
        var argus = arguments;
        clearTimeout(_runTimeout);
        var _waitTime = getWaitTime(self.base, self.exponential++, self.maxWaitTime) * 1000;
        _runTimeout = setTimeout(function() {
            self.run(argus);
        }, _waitTime);
    };
})();
function generateEvent(s, args) {
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(s, false, false, args);
    return evt;
}

function addEvent(eventTarget, self) {
    eventTarget.addEventListener('open', function(event) {
        self.onopen(event);
    });
    eventTarget.addEventListener('close', function(event) {
        self.onclose(event);
    });
    eventTarget.addEventListener('connecting', function(event) {
        self.onconnecting(event);
    });
    eventTarget.addEventListener('message', function(event) {
        self.onmessage(event);
    });
    eventTarget.addEventListener('error', function(event) {
        self.onerror(event);
    });
};

function isString(v) {
    return typeof v === "string" || v instanceof String;
}

function getRequestKey(data) {
    var param = data;
    if (!param) {
        return null;
    }

    if (isString(param)) {
        param = {
            url: param
        }
    }

    if (!param.method) {
        param.method = 'GET';
    }

    var key = null;
    if (param.url) {
        key = ["strict:", param.method.toUpperCase(), ":", param.url.split("?")[0]].join("");
    } else {
        key = JSON.stringify(param);
    }

    return key;
};

function NohupWebSocket(url, protocols, options) {
    // Default settings
    var settings = {
        debug: false,
        automaticOpen: true,
        timeoutInterval: 2000,
        maxReconnectAttempts: null,
        binaryType: 'blob'
    };
    if (!options) {
        options = {};
    }
    for (var key in settings) {
        if (typeof options[key] !== 'undefined') {
            this[key] = options[key];
        } else {
            this[key] = settings[key];
        }
    }
    this.url = url;
    this.reconnectAttempts = 0;
    this.readyState = WebSocket.CONNECTING;
    this.protocol = null;
    // Private state variables
    var self = this;
    var ws;
    var forcedClose = false;
    var eventTarget = document.createElement('div');
    var reconnectWs = new Karn({
        maxWaitTime: self.maxReconnectWaitTime,
        base: self.reconnectBaseTime
    });
    this.sendMap = {};
    this.subMap = {};
    this.patternMap = {};
    addEvent(eventTarget, self);
    this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
    this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
    this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);
    reconnectWs.run = this.open = function(reconnectAttempt) {
        ws = new WebSocket(self.url, protocols || []);
        ws.binaryType = this.binaryType;
        if (!reconnectAttempt) {
            eventTarget.dispatchEvent(generateEvent('connecting'));
            this.reconnectAttempts = 0;
        }
        if (self.debug || NohupWebSocket.debugAll) {
            console.debug('NohupWebSocket', 'attempt-connect', self.url);
        }
        ws.onopen = function(event) {
            reconnectWs.reset();
            if (self.debug || NohupWebSocket.debugAll) {
                console.debug('NohupWebSocket', 'onopen', self.url);
            }
            self.protocol = ws.protocol;
            self.readyState = WebSocket.OPEN;
            self.reconnectAttempts = 0;
            var e = generateEvent('open');
            e.isReconnect = reconnectAttempt;
            reconnectAttempt = false;
            eventTarget.dispatchEvent(e);
        };
        ws.onclose = function(event) {
            ws = null;
            if (forcedClose) {
                self.readyState = WebSocket.CLOSED;
                eventTarget.dispatchEvent(generateEvent('close'));
            } else {
                self.readyState = WebSocket.CONNECTING;
                var e = generateEvent('connecting');
                e.code = event.code;
                e.reason = event.reason;
                e.wasClean = event.wasClean;
                eventTarget.dispatchEvent(e);
                // if (!reconnectAttempt && !timedOut) {
                //     if (self.debug || NohupWebSocket.debugAll) {
                //         console.debug('NohupWebSocket', 'onclose', self.url);
                //     }
                //     eventTarget.dispatchEvent(generateEvent('close'));
                // }
                reconnectWs.execute(true);
            }
        };
        ws.onmessage = function(event) {
            if (self.debug || NohupWebSocket.debugAll) {
                console.debug('NohupWebSocket', 'onmessage', self.url, event.data);
            }

            var data = null;

            try {
                data = JSON.parse(event.data);
            } catch (e) {
                data = event.data;
            }

            if (data == 'ping' ||
                (data &&
                    (data.data == 'ping' ||
                        (data.request && data.request.url == "ping")))) {
                self.pong();
            }

            var e = generateEvent('message');
            e.data = data;
            eventTarget.dispatchEvent(e);
        };
        ws.onerror = function(event) {
            if (self.debug || NohupWebSocket.debugAll) {
                console.debug('NohupWebSocket', 'onerror', self.url, event);
            }
            eventTarget.dispatchEvent(generateEvent('error'));
        };
    };
    if (this.automaticOpen == true) {
        this.open(false);
    }

    this.send = function(data) {
        if (ws) {
            if (self.debug || NohupWebSocket.debugAll) {
                console.debug('NohupWebSocket', 'send', self.url, data);
            }
            var key = getRequestKey(data),
                deferred = Q.defer();
            ws.send(JSON.stringify(data));
            self.sendMap[key] = deferred;
            return deferred.promise;
        } else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }
    };

    this.sub = function(data) {
        var key = getRequestKey(data);
        var deferred = Q.defer();
        var subs = self.subMap[key];
        if (subs) {
            subs.push(deferred);
        } else {
            self.subMap[key] = [deferred];
        }
        return deferred.promise;
    };

    this.psub = function(data) {
        var key = getRequestKey(data);
        var deferred = Q.defer();
        if (!key.startsWith("strict:")) {
            return;
        }

        key = key.substring(7);

        var subs = self.patternMap[key];
        if (subs) {
            subs.push(deferred);
        } else {
            self.patternMap[key] = [deferred];
        }
        return deferred.promise;
    };

    this.unsub = function(data) {
        var key = getRequestKey(data);
        var subs = self.subMap[key];
        if (subs) {
            self.subMap[key] = null;
            delete self.subMap[key];
        }
        return true;
    };

    this.unpsub = function(data) {
        var key = getRequestKey(data),
            psubs = this.patternMap[key];

        var keys = [];

        var ks = null,
            pMethod = null,
            pUrl = null,
            val = null;
        for (var i in psubs) {
            ks = i.split(":");
            pMethod = ks[0];
            pUrl = ks[1];
            val = psubs[i];
            if (val && pMethod == _method && new RegExp(pUrl, "ig").test(_url)) {
                keys.push(i);
            }
        }

        keys.forEach(function(item) {
            psubs[item] = null;
            delete psubs[item];
        })
    };

    this.pong = function() {
        // this.send({
        //     url: 'pong'
        // });
        this.send("pong");
    };

    /**
     * Closes the WebSocket connection or connection attempt, if any.
     * If the connection is already CLOSED, this method does nothing.
     */
    this.close = function(code, reason) {
        // Default CLOSE_NORMAL code
        if (typeof code == 'undefined') {
            code = 1000;
        }
        // forcedClose = true;
        if (ws) {
            ws.close(code, reason);
        }
    };

    /**
     * Additional public API method to refresh the connection if still open (close, re-open).
     * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
     */
    this.refresh = function() {
        if (ws) {
            ws.close();
        }
    };
}

/**
 * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
 * this indicates that the connection is ready to send and receive data.
 */
NohupWebSocket.prototype.onopen = function(event) {};
/** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
NohupWebSocket.prototype.onclose = function(event) {};
/** An event listener to be called when a connection begins being attempted. */
NohupWebSocket.prototype.onconnecting = function(event) {};
/** An event listener to be called when a message is received from the server. */

NohupWebSocket.prototype.onmessage = function(event) {
    var self = this;
    var data = event.data;

    if (!data || !data.request) {
        return;
    }
    var request = data.request,
        _url = request.url,
        _method = request.method || "GET";

    if (!_url) {
        return;
    }

    var key = getRequestKey(request),
        send = self.sendMap[key],
        subs = self.subMap[key],
        psubs = self.patternMap;

    if (send) {
        send.notify(data);
    }

    if (subs) {
        subs.forEach(function(item) {
            item.notify(data);
        });
    }

    var ks = null,
        pMethod = null,
        pUrl = null,
        val = null;
    for (var i in psubs) {
        ks = i.split(":");
        pMethod = ks[0];
        pUrl = ks[1];
        val = psubs[i];
        if (val && pMethod == _method && new RegExp(pUrl, "ig").test(_url)) {
            val.forEach(function(item) {
                item.notify(data);
            });
        }
    }
};
/** An event listener to be called when an error occurs. */
NohupWebSocket.prototype.onerror = function(event) {};

/**
 * Whether all instances of NohupWebSocket should log debug messages.
 * Setting this to true is the equivalent of setting all instances of NohupWebSocket.debug to true.
 */
NohupWebSocket.debugAll = false;

NohupWebSocket.CONNECTING = WebSocket.CONNECTING;
NohupWebSocket.OPEN = WebSocket.OPEN;
NohupWebSocket.CLOSING = WebSocket.CLOSING;
NohupWebSocket.CLOSED = WebSocket.CLOSED;
NohupWebSocket.getInstance = function(url, protocols, options) {
    if (!NohupWebSocket.instance) {
        NohupWebSocket.instance = new NohupWebSocket(url, protocols, options);
    }
    return NohupWebSocket.instance;
};
return NohupWebSocket;
}));
