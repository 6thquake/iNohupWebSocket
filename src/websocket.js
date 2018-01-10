module.exports = function (ws,self,protocols,reconnectAttempt,ReconnectingWebSocket,eventTarget,generateEvent) {
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

    if (self.debug || ReconnectingWebSocket.debugAll) {
        console.debug('ReconnectingWebSocket', 'attempt-connect', self.url);
    }

    var localWs = ws;
    var timeout = setTimeout(function () {
        if (self.debug || ReconnectingWebSocket.debugAll) {
            console.debug('ReconnectingWebSocket', 'connection-timeout', self.url);
        }
        timedOut = true;
        localWs.close();
        timedOut = false;
    }, self.timeoutInterval);

    ws.onopen = function (event) {
        clearTimeout(timeout);
        if (self.debug || ReconnectingWebSocket.debugAll) {
            console.debug('ReconnectingWebSocket', 'onopen', self.url);
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
                if (self.debug || ReconnectingWebSocket.debugAll) {
                    console.debug('ReconnectingWebSocket', 'onclose', self.url);
                }
                eventTarget.dispatchEvent(generateEvent('close'));
            }
            reconnectWs.execute(true);
        }
    };
    ws.onmessage = function (event) {
        if (self.debug || ReconnectingWebSocket.debugAll) {
            console.debug('ReconnectingWebSocket', 'onmessage', self.url, event.data);
        }
        var e = generateEvent('message');
        e.data = event.data;
        eventTarget.dispatchEvent(e);
    };
    ws.onerror = function (event) {
        if (self.debug || ReconnectingWebSocket.debugAll) {
            console.debug('ReconnectingWebSocket', 'onerror', self.url, event);
        }
        eventTarget.dispatchEvent(generateEvent('error'));
    };
};