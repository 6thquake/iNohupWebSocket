function addEvent(eventTarget,self) {
    eventTarget.addEventListener('open', function (event) {
        self.onopen(event);
    });
    eventTarget.addEventListener('close', function (event) {
        self.onclose(event);
    });
    eventTarget.addEventListener('connecting', function (event) {
        self.onconnecting(event);
    });
    eventTarget.addEventListener('message', function (event) {
        self.onmessage(event);
    });
    eventTarget.addEventListener('error', function (event) {
        self.onerror(event);
    });
};