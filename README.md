# iNohupWebSocket
> Websocket工具类，除支持原生Websocket方法外，还支持自动重连、Ping Pong、Notification的操作，接收服务端消息后的api封装处理，消息订阅等。

### Requirements
1. 
  ```javascript
  q >= 1.5.1
  ```

### install 
  * using npm
  ```bash
  $ npm install @6thquake/inohupwebsocket
  ``` 
  * using yarn
  ```bash
  $ yarn add @6thquake/inohupwebsocket
  ``` 
  
### build 
  * gulp
  ```bash
  $ npm install gulp
  ```  
  * dependencies
  ```bash
  $ npm install
  ```   
  * build
  ```bash
  $ gulp
  ```

### Usage
1. 在html里引入q、iNohupWebSocket
    ```html
    <script type="text/javascript" src="http://apps.bdimg.com/libs/q.js/2.0.1/q.js"></script>
    <script type="text/javascript" src="https://github.com/6thquake/iNohupWebSocket/tree/master/dist/NohupWebSocket.js"></script>
    ```
2. 初始化
    ```javascript
    var ws = NohupWebSocket.getInstance('ws://xxx', protocol, options);
    // 参数和原生websocket的参数保持一致，options多了两个可选属性 maxReconnectWaitTime reconnectBaseTime
    // maxReconnectWaitTime:重连最大等待时间，默认30s
    // reconnectBaseTime:重连采用指数退避算法，reconnectBaseTime为底数，默认2
    ```
3. 基本功能

   1. 设置事件处理函数（onopen、onclose、onconnecting、onmessage、onerror）
      ```javascript
      ws.onopen = function(event){};
      ws.onconnecting = function(event){};
      ws.onmessage = function(event){};
      ws.onerror = function(event){};
      ws.onclose = function(event){};
      ```
   
   2. 发送消息（send）
      ```javascript
      ws.send({
        url: 'tsbot/cases/437'
      }).then(function (data) {
        console.log("success");
      }, function (err) {
        console.log("error");
      }, function (n) {
        console.log("fially");
      });
      ```
        
   3. 消息订阅（sub、psub、unsub、unpsub）
      ```javascript
      /**
       * 1. 客户端send数据：此接口模拟http协议，提供url来确定频道，可以使用restful接口来定义和后端服务的映射关系，
       * 参数可以放在链接上也可以通过?来分隔链接和参数，e.g.
       *    1. { url: 'users/1', method:'GET' }
       *    2. { url: 'users/1?name=xxx' }
       *
       * 2. 服务端响应：对应服务端需要将请求的数据返回回来，e.g.
       *    {
       *      request: {
       *         url: 'users/1'
       *      },
       *      data: {}, //数据
       *      type: 'NOTIFICATION' // 可选 NOTIFICATION（自动调用浏览器的Notification api）
       *    }
       *
       * 3. 对应的客户端处理数据：
       *  ws.sub({
       *     url: 'users/1'
       *  }).then(success, error, finally);
       *
       *  ws.psub({
       *     url: 'users/*'
       *  }).progress(function(data){});
       *  
       *  ws.notification().progress(function(data){}); // 处理服务端返回的type为NOTIFICATION的所有消息
       */

      // 按频道订阅 
      ws.sub({
        url: "tsbot/cases/437"
      }).then(function (data) {
        console.log("success");
      }, function (err) {
        console.log("error");
      }, function (n) {
        console.log("fially");
      });
      
      // 支持按正则表达式订阅
      ws.psub({
        url: "tsbot/cases/*"
      }).progress(function (data) {
        console.log("success");
      };

      // 按频道解除订阅
      ws.unsub({
        url: "tsbot/cases/437"
      })

      // 按正则解除订阅
      ws.unpsub({
        url: "tsbot/cases/*"
      })
      ```

   4. close 、refresh
      ```javascript

      ws.refresh();

      ws.close();

      ```

###### 需要引入[Q](https://github.com/kriskowal/q)，支持AMD、CMD 

