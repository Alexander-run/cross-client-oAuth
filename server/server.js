const WebSocket = require('ws');

const wsClient = new WebSocket.Server({ port: 3050 });
const wsInterceptor = new WebSocket.Server({port:3051})
let connectionCount = 0
wsClient.on('connection', (ws) => {
  console.log('Client connected');
  connectionCount++
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // 广播消息给所有连接的客户端
    wsInterceptor.clients.forEach((client) => {
      console.log('sent once')
      client.send(message);
    });
  });
  console.log('当前连接数', connectionCount)
  ws.on('close', () => {
    console.log('Client disconnected');
    connectionCount--
  });
});
wsInterceptor.on('connection', (ws) => {
  console.log('Client connected');
  connectionCount++
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // 广播消息给所有连接的客户端
    wsClient.clients.forEach((client) => {
      console.log('sent once')
      client.send(message);
    });
  });
  console.log('当前连接数', connectionCount)
  ws.on('close', () => {
    console.log('Client disconnected');
    connectionCount--
  });
});

console.log('WebSocket server is running on ws://localhost:3050');