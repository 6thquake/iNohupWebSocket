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