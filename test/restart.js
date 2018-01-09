const Restart = require('../lib/restart');
let r = new Restart(1, 3, 5);

let a = function (obj) {
    obj.success();
};
a({
    t: 0,
    success: function () {
        if (this.t == 10) {
            console.log('ok');
        } else {
            console.log('restart');
            this.error();
        }
    },
    error: function () {
        var self = this;
        r.execute(self.success.bind(self));
        this.t++;
    }
});