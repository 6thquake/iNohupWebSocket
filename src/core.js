/**
 * 1.open
 * 2.message
 * 3.close
 * 4.reconnect
 * 5.消息分类
 */
let ReconnectingWebSocket = require('./reconnecting-websocket');
class Ws extends ReconnectingWebSocket{
    constructor(url, protocols, options){
        super(url, protocols, options);
        this.subscribers = {};
    }
    addEventListener1(path,fn){
        this.subscribers[path] = fn;
    }
    dispatchEvent1(path,data){
        this.subscribers[path](data);
    }
    sub(path){
        let self = this;
        return new Promise(function (resolve,reject) {
            self.addEventListener1(path,function (data) {
                console.log(data);
                resolve(data);
                // let data = event.data;
                // if(data){
                //     data = JSON.parse(data);
                //     let path = data.request.url;
                //     self.subscribers[path] = data;
                // }
                // resolve(self.subscribers[path]);
            });

        });
    }
    /**
     * 生成事件
     * @param s
     * @param args
     * @return {Event}
     */
    generateEvent(s, args) {
        const evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(s, false, false, args);
        return evt;
    }
    onmessage(event){
        let data = event.data;
        if(data){
            data = JSON.parse(data);
            let path = data.request.url;
            this.dispatchEvent1(path,data);
        }
    }
}
module.exports =  Ws;