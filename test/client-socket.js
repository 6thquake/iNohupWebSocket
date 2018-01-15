var ws = NohupWebSocket.getInstance('ws://localhost:8080/');
ws.addEventListener('open',function () {
    ws.send({user: "jxzhuang", namespace: "tsbot"});
});
ws.addEventListener('open',function () {
    ws.send({url: 'tsbot/cases/437'}).then(function (data) {
        console.log(data);
    }, function (err) {
        console.log(err);
    }, function (n) {
        console.log(n);
    });
});
ws.sub({url: "switches/tsbot/cases"}).then(function (data) {
    console.log()
}, function () {

}, function (n) {
    console.log(n);
});
ws.sub({url: "tsbot/cases"}).then(function (data) {
    console.log()
}, function () {

}, function (n) {
    console.log(12, n);
});
document.querySelector('body').addEventListener('click', function (event) {
    let nodeTarget = event.target;
    if (nodeTarget.nodeName === 'BUTTON') {
        const id = nodeTarget.innerHTML;
        ws.send({url: `tsbot/cases/${id}`}).then(function (data) {
            console.log(data);
        }, function (err) {
            console.log(err);
        }, function (n) {
            console.log(n);
        });
    }
});