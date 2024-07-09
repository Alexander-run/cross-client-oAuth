const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3050 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // 广播消息给所有连接的客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  // ping pong to maintain connection
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping()
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected');
    if (interval) clearInterval(interval)
  });
});

console.log('WebSocket server is running on ws://localhost:3050');