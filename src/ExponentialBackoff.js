var _beyondMaxWaitTime = false,_runTimeout;
function ExponentialBackoff(options) {
    var _options = {
        maxWaitTime: 30,
        run: function () {
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
ExponentialBackoff.prototype.execute = function () {
    var self = this;
    var argus = arguments;
    clearTimeout(_runTimeout);
    function getWaitTime() {
        var _currentWaitTime;
        if (!_beyondMaxWaitTime) {
            _currentWaitTime = Math.pow(self.base, self.exponential++);
        }else {
            return self.maxWaitTime;
        }
        if (_currentWaitTime >= self.maxWaitTime) {
            _currentWaitTime = self.maxWaitTime;
            _beyondMaxWaitTime = true;
        }
        return _currentWaitTime;
    }
    var _waitTime = getWaitTime() * 1000;
    _runTimeout = setTimeout(function () {
        self.run(argus);
    }, _waitTime);
};