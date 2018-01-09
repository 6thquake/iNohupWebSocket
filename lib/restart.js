/**
 * 失败后重启
 *  默认：
 *      1s 3s 5s 10s 30s 30s
 */

class Restart {
    constructor() {
        this.timeBox = [...arguments]||[1, 3, 5, 10];
        this.time = 0;
        this.c = 0;
        this.timeout = null;
    }

    start() {
        console.log('restart ', this.time);
        if (this.c == 6) {
            console.log('ok');
        } else {
            this.execute();
        }
    }

    execute(fun = this.start) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            fun();
            if (this.time < this.timeBox.length - 1) {
                this.time++;
            }
            this.c++;
        }, this.timeBox[this.time] * 1000);
    }
}
// module.default = Restart;

