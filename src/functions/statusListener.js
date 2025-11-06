const { getClient, releaseClient } = require('./dbClient');

let client;
let isConnecting = false;
let reconnectTimeout;

async function startNotificationListener(onMessage) {
    if (isConnecting) {
        console.log('Connection attempt already in progress');
        return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }

    isConnecting = true;

    try {
        // Release existing client if any
        if (client) {
            await releaseClient(client);
            client = null;
        }

        client = await getClient();
        console.log('PostgreSQL client connected for LISTEN');

        await client.query('LISTEN sensor_status');
        console.log('Listening on channel: sensor_status');

        client.on('notification', (msg) => {
            try {
                const payload = JSON.parse(msg.payload);
                console.log('Notification received:', payload);
                onMessage(payload);
            } catch (error) {
                console.error('Error parsing notification:', error);
            }
        });

        client.on('error', (err) => {
            console.error('PostgreSQL notification listener error:', err);
            handleDisconnect(onMessage);
        });

        client.on('end', () => {
            console.log('PostgreSQL connection ended');
            handleDisconnect(onMessage);
        });

    } catch (err) {
        console.error('Failed to set up notification listener:', err);
        handleDisconnect(onMessage);
    } finally {
        isConnecting = false;
    }
}

function handleDisconnect(onMessage) {
    if (client) {
        releaseClient(client);
        client = null;
    }

    console.log('Attempting to reconnect in 5 seconds...');
    reconnectTimeout = setTimeout(() => {
        startNotificationListener(onMessage);
    }, 5000);
}

// Clean up on module unload
process.on('beforeExit', () => {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
    if (client) {
        releaseClient(client);
    }
});

module.exports = { startNotificationListener };