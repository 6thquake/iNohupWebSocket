# iNohupWebSocket
> 携程系统研发前端团队开发的websocket工具类，除支持原生websocket方法外，还支持重连、消息订阅的操作，支持链式调用。

### Requirements
1.
    ```javascript
       q       >=1.5.1
    ```
### Usage
1. 在html里引入q、iNohupWebSocket
    ``` html
    <script type="text/javascript" src="http://apps.bdimg.com/libs/q.js/2.0.1/q.js"></script>
    <script type="text/javascript" src="http://git.dev.sh.ctripcorp.com/cdportal/iNohupWebSocket/tree/master/dist/index.js"></script>
    ```
2. 初始化
    ```javascript
    var ws = NohupWebSocket.getInstance('ws://xxx',protocol,options);
    //参数和原生websocket的参数一样，options多了两个可选属性 maxReconnectWaitTime reconnectBaseTime
    //maxReconnectWaitTime:重连最大等待时间，默认30s
    //reconnectBaseTime:重连采用指数退避算法，reconnectBaseTime为底数，默认2

    ```
3. 基本功能

   1. addEventListener 订阅事件
        ``` javascript
       ws.addEventListener('open',callBack);
       ws.addEventListener('message',callBack);
       ws.addEventListener('open',callBack);
       ```
   2. onopen、onclose、onconnecting
    
        * close 关闭socket链接
     
   2. send 发送消息，参数类型对象
   
        ```javascript
          ws.send({url: 'tsbot/cases/437'}).then(function (data) {
               console.log(data);
          }, function (err) {
               console.log(err);
          }, function (n) {
              // 如果返回值，自动触发
              console.log(n);
          });
        ```
        
   3. 消息订阅
   
         ```javascript
         ws.sub({url: "switches/tsbot/cases"}).then(function (data) {
             console.log()
         }, function () {
         
         }, function (n) {
             console.log("第一次订阅");
         });
        //多次订阅
        ws.sub({url: "switches/tsbot/cases"}).then(function (data) {
            console.log()
        }, function () {
        
        }, function (n) {
            console.log("第二次订阅");
        });
         ```
            
## Build Setup
    
  * install gulp
  ```bash
    npm install -g gulp
  ```  
  * install dependencies
  ```bash
    npm install
  ```   
  * build
  ```bash
      gulp
  ```

###### 需要引入[Q](https://github.com/kriskowal/q)，支持AMD、CMD 

