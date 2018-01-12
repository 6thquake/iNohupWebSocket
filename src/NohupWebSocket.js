var Restart = require('./ExponentialBackoff');
var Q = require('q');
var generateEvent = require('./generateEvent');

function NohupWebSocket(url, protocols, options) {
    // Default settings
    var settings = {

        /** Whether this instance should log debug messages. */
        debug: false,

        /** Whether or not the websocket should attempt to connect immediately upon instantiation. */
        automaticOpen: true,
        reconnectDecay: 1.5,

        /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
        timeoutInterval: 2000,

        /** The maximum number of reconnection attempts to make. Unlimited if null. */
        maxReconnectAttempts: null,

        /** The binary type, possible values 'blob' or 'arraybuffer', default 'blob'. */
        binaryType: 'blob'
    }
    if (!options) {
        options = {};
    }

    // Overwrite and define settings with options if they exist.
    for (var key in settings) {
        if (typeof options[key] !== 'undefined') {
            this[key] = options[key];
        } else {
            this[key] = settings[key];
        }
    }

    // These should be treated as read-only properties

    /** The URL as resolved by the constructor. This is always an absolute URL. Read only. */
    this.url = url;

    /** The number of attempted reconnects since starting, or the last successful connection. Read only. */
    this.reconnectAttempts = 0;

    /**
     * The current state of the connection.
     * Can be one of: WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
     * Read only.
     */
    this.readyState = WebSocket.CONNECTING;

    /**
     * A string indicating the name of the sub-protocol the server selected; this will be one of
     * the strings specified in the protocols parameter when creating the WebSocket object.
     * Read only.
     */
    this.protocol = null;

    // Private state variables
    var self = this;
    var ws;
    var forcedClose = false;
    var timedOut = false;
    var eventTarget = document.createElement('div');
    var reconnectWs = new Restart({
        max: self.maxReconnectTime,
        num: self.num,
        ex: self.ex
    });
    this.sendMap = {};
    this.subMap = {};
    // Wire up "on*" properties as event handlers

    require('./addevent')(eventTarget, self);

    // Expose the API required by EventTarget

    this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
    this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
    this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);


    reconnectWs.run = this.open = function (reconnectAttempt) {
        ws = new WebSocket(self.url, protocols || []);
        ws.binaryType = this.binaryType;

        if (reconnectAttempt) {
            if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
                return;
            }
        } else {
            eventTarget.dispatchEvent(generateEvent('connecting'));
            this.reconnectAttempts = 0;
        }

        if (self.debug || NohupWebSocket.debugAll) {
            console.debug('NohupWebSocket', 'attempt-connect', self.url);
        }

        var localWs = ws;
        var timeout = setTimeout(function () {
            if (self.debug || NohupWebSocket.debugAll) {
                console.debug('NohupWebSocket', 'connection-timeout', self.url);
            }
            timedOut = true;
            localWs.close();
            timedOut = false;
        }, self.timeoutInterval);

        ws.onopen = function (event) {
            clearTimeout(timeout);
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
        ws.onclose = function (event) {
            clearTimeout(timeout);
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
                if (!reconnectAttempt && !timedOut) {
                    if (self.debug || NohupWebSocket.debugAll) {
                        console.debug('NohupWebSocket', 'onclose', self.url);
                    }
                    eventTarget.dispatchEvent(generateEvent('close'));
                }
                reconnectWs.execute(true);
            }
        };
        ws.onmessage = function (event) {
            if (self.debug || NohupWebSocket.debugAll) {
                console.debug('NohupWebSocket', 'onmessage', self.url, event.data);
            }
            var e = generateEvent('message');
            e.data = event.data;
            eventTarget.dispatchEvent(e);
        };
        ws.onerror = function (event) {
            if (self.debug || NohupWebSocket.debugAll) {
                console.debug('NohupWebSocket', 'onerror', self.url, event);
            }
            eventTarget.dispatchEvent(generateEvent('error'));
        };
    }
    // Whether or not to create a websocket upon instantiation
    if (this.automaticOpen == true) {
        this.open(false);
    }

    /**
     * Transmits data to the server over the WebSocket connection.
     *
     * @param data a text string, ArrayBuffer or Blob to send to the server.
     */
    this.send = function (data) {
        if (ws) {
            if (self.debug || NohupWebSocket.debugAll) {
                console.debug('NohupWebSocket', 'send', self.url, data);
            }
            var key = JSON.stringify(data);
            ws.send(key);

            var deferred = Q.defer();
            self.sendMap[key] = deferred;
            return deferred.promise;

        } else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }
    };
    this.sub = function (data) {
        var key = JSON.stringify(data);
        var deferred = Q.defer();
        var subs = self.subMap[key];
        if(subs){
            subs.push(deferred);
        }else {
            self.subMap[key] = [deferred];
        }
        return deferred.promise;
    };

    /**
     * Closes the WebSocket connection or connection attempt, if any.
     * If the connection is already CLOSED, this method does nothing.
     */
    this.close = function (code, reason) {
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
    this.refresh = function () {
        if (ws) {
            ws.close();
        }
    };
}

/**
 * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
 * this indicates that the connection is ready to send and receive data.
 */
NohupWebSocket.prototype.onopen = function (event) {
};
/** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
NohupWebSocket.prototype.onclose = function (event) {
};
/** An event listener to be called when a connection begins being attempted. */
NohupWebSocket.prototype.onconnecting = function (event) {
};
/** An event listener to be called when a message is received from the server. */


NohupWebSocket.prototype.onmessage = function (event) {
    var data = event.data;
    var self = this;
    if (data) {
        data = JSON.parse(data);
        var key = JSON.stringify(data.request),
            send = self.sendMap[key],
            subs = self.subMap[key];
        if (send) {
            send.notify(data);
        }
        if (subs) {
            subs.forEach(function (item) {
                item.notify(data);
            });
        }
    }
};
/** An event listener to be called when an error occurs. */
NohupWebSocket.prototype.onerror = function (event) {
};

/**
 * Whether all instances of NohupWebSocket should log debug messages.
 * Setting this to true is the equivalent of setting all instances of NohupWebSocket.debug to true.
 */
NohupWebSocket.debugAll = false;

NohupWebSocket.CONNECTING = WebSocket.CONNECTING;
NohupWebSocket.OPEN = WebSocket.OPEN;
NohupWebSocket.CLOSING = WebSocket.CLOSING;
NohupWebSocket.CLOSED = WebSocket.CLOSED;
NohupWebSocket.getInstance = function () {
    if (!NohupWebSocket.instance) {
        NohupWebSocket.instance = new NohupWebSocket('ws://10.2.44.97/websocket');
    }
    return NohupWebSocket.instance;
};
// return NohupWebSocket;
module.exports = NohupWebSocket;