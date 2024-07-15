// 初始化 WebSocket 连接
let socket;
function initWebSocket () {
  socket = new WebSocket('ws://www.fnovatech.com/wsi'); // 修改服务器url

  // 处理 WebSocket 连接打开事件
  socket.addEventListener('open', () => {
    console.log('WebSocket connection opened');
  });
  
  // 处理 WebSocket 消息事件
  socket.addEventListener('message', (event) => {
    console.log('Message from server:', event);
    const blobReader = new Response(event.data).json()
    blobReader.then(res => {
      const { type, data } = res;
      console.log(data)
      if (type === 'REDIRECT_OAUTH_RESULT') {
        // 在本地打开redirect location
        chrome.tabs.create({ url: data }, (tab) => {
          console.log('New tab opened:', tab);
        });
      }
    })
    // 根据需要处理从服务器接收的消息
    
  });
  // 处理 WebSocket 连接关闭事件
  socket.addEventListener('close', () => {
    console.log('WebSocket connection closed');
  });

  // 处理 WebSocket 错误事件
  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', JSON.parse(error));
  });
};

// 发送消息的函数
async function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket is not open. Ready state:', socket.readyState);
    initWebSocket()
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify(message));
    })
  }
};

initWebSocket()

// DNR 规则匹配调试
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  console.log("oAuth from microsoft intercepted", info);
  chrome.declarativeNetRequest.updateEnabledRulesets(
    {
      disableRulesetIds: ['ruleset_1']
    },
    () => {
      console.log('blocking rules updated')
    }
  )
  // send info.request to server
  const msg = {
    type: 'START_NEW_OAUTH',
    data: info.request.url
  }
  sendMessage(msg)
});