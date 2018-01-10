function Restart(options) {
    var _options = {
        max: 30,
        run: function () {
            this.execute();
        },
        num: 2,
        ex: 0
    };
    if (!options) {
        options = _options;
    }
    for (var k in _options) {
        this[k] = options[k] || _options[k];
    }
}

Restart.prototype.execute = function () {
    var self = this;
    var argus = arguments;

    function getTime() {
        if(!self._beyond){
            self._current = Math.pow(self.num, self.ex++);
        }
        if (self._current >= self.max) {
            self._current = self.max;
            self._beyond = true;
        }
        return self._current;
    }

    var time = getTime() * 1000;
    console.log(this._current, time / 1000);
    setTimeout(function () {
        self.run(argus);
    }, time);
};
module.exports = Restart;

