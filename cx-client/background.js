// 初始化 WebSocket 连接
let socket;

function initWebSocket() {
    socket = new WebSocket('ws://www.fnovatech.com/ws'); // 修改服务器url

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
            if (type === 'START_NEW_OAUTH' && data) {
                // TODO 把redirect_uri拆解出来存到storage
                const urlObj = new URL(data)
                const params = new URLSearchParams(urlObj.search)
                const redirect_uri = params.get('redirect_uri') 
                chrome.storage.local.set({
                    redirect_uri
                })
                // 打开新标签页 TODO debug
                chrome.tabs.create({ url: data }, (tab) => {
                    console.log('New tab opened:', tab);
                });
            }
        })
    });

    // 处理 WebSocket 连接关闭事件
    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        // 重新初始化 WebSocket 连接
        setTimeout(initWebSocket, 1000); // 1秒后重试连接
    });

    // 处理 WebSocket 错误事件
    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

// 初始化 WebSocket
initWebSocket();
// TODO 监听响应，将redirect_uri(Azure可能也是location)以及oAuth认证相关的code/token发向服务器
chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        // 处理并打印响应头
        for (let header of details.responseHeaders) {
            if (header.name === 'location' && isRedirectUrlMatched(header.value)) {
                console.log(header.name+': ', header.value)
                if (socket && socket.readyState === WebSocket.OPEN) {
                    const msg = {
                        type: 'REDIRECT_OAUTH_RESULT',
                        data: header.value
                    }

                    socket.send(JSON.stringify(msg));
                } else {
                    console.error('WebSocket is not open. Ready state:', socket.readyState);
                }
            }
        }

        // 可以修改响应头，例如添加新的头部
        details.responseHeaders.push({ name: 'X-Added-Header', value: 'MyHeaderValue' });

        return { responseHeaders: details.responseHeaders };
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

const isRedirectUrlMatched = (url) => {
    return true
    chrome.storage.local.get('redirect_uri', (result) => {
        // TODO match url domain and result.redirect_uri
        // if matched return true, else false
        
    })
}