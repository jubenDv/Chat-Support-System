const WebSocket = require('ws');
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('WebSocket server is running\n');
});

const wss = new WebSocket.Server({ server });

const chatSessions = {}; // Store chat sessions

wss.on('connection', (ws, req) => {
    console.log('Client connected');
    
    // Parse query parameters to get chat_id
    const query = url.parse(req.url, true).query;
    const chatId = query.chat_id;

    if (chatId) {
        // Handle the chat session
        if (!chatSessions[chatId]) {
            chatSessions[chatId] = [];
        }
        chatSessions[chatId].push(ws);

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === 'request_chat') {
                    // Handle chat request
                    const newChatId = 'chat_' + Math.random().toString(36).substring(2, 15);
                    ws.send(JSON.stringify({ type: 'chat_id', chat_id: newChatId }));
                } else if (data.type === 'message') {
                    // Handle incoming message
                    const { chat_id, message, sender } = data;
                    if (chatSessions[chat_id]) {
                        chatSessions[chat_id].forEach((client) => {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'message', sender, message }));
                            }
                        });
                    }
                } else if (data.type === 'end_chat') {
                    // Handle chat end
                    const { chat_id } = data;
                    if (chatSessions[chat_id]) {
                        chatSessions[chat_id].forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'end_chat' }));
                                client.close();
                            }
                        });
                        delete chatSessions[chat_id];
                    }
                }
            } catch (e) {
                console.error('Error processing message:', e);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            if (chatSessions[chatId]) {
                chatSessions[chatId] = chatSessions[chatId].filter(client => client !== ws);
                if (chatSessions[chatId].length === 0) {
                    delete chatSessions[chatId];
                }
            }
        });
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'No chat_id provided' }));
        ws.close();
    }
});

server.listen(8080, () => {
    console.log('Server is listening on http://127.0.0.1:8080');
});
