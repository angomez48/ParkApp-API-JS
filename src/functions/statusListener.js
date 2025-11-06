const { getClient } = require('./dbClient');

let client;
let isConnecting = false;

async function startNotificationListener(onMessage) {
    if (isConnecting) {
        console.log('Connection attempt already in progress');
        return;
    }

    isConnecting = true;

    try {
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
            reconnect(onMessage);
        });

        client.on('end', () => {
            console.log('PostgreSQL connection ended');
            reconnect(onMessage);
        });

    } catch (err) {
        console.error('Failed to set up notification listener:', err);
        reconnect(onMessage);
    } finally {
        isConnecting = false;
    }
}

function reconnect(onMessage) {
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(() => {
        startNotificationListener(onMessage);
    }, 5000);
}

module.exports = { startNotificationListener };