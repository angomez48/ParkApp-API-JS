const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { startNotificationListener } = require('./functions/statusListener');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
});

// Connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    // Heartbeat
    const interval = setInterval(() => {
        if (ws.isAlive === false) {
            console.log('Terminating dead connection');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    }, 30000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

// Broadcast function
const broadcast = (payload) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
        }
    });
};

// Start notification listener
startNotificationListener(broadcast);

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});