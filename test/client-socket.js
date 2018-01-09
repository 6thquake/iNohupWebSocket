var ws = new Ws('ws://cts.release.ctripcorp.com/websocket');
ws.onopen = function () {
    this.send({user: "jxzhuang", namespace: "tsbot"}).sub('switches/tsbot/cases').then(function (data) {
        console.log(data);
    },function (err) {
        console.log(err);
    });
    this.send({url: "tsbot/cases"}).sub("tsbot/cases").then(function (data) {
        console.log(data);
    },function (err) {
        console.log(err);
    });
};
document.querySelector('body').addEventListener('click',function (event) {
    let nodeTarget = event.target;
    if(nodeTarget.nodeName==='BUTTON'){
        const id = nodeTarget.innerHTML;
        ws.send({url: `tsbot/cases/${id}`}).sub(`tsbot/cases/${id}`).then(function (data) {
            console.log(data);
        },function (err) {
            console.log(err);
        });
    }

});