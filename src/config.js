const getWebSocketConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    protocol: isDevelopment ? 'ws' : 'wss',
    // Use api prefix for Azure Static Web Apps
    host: isDevelopment ? 'localhost' : 'witty-beach-062ca4b10.3.azurestaticapps.net',
    port: isDevelopment ? 8080 : null,
    path: isDevelopment ? '/ws' : '/api/ws'  // Add /api prefix for production
  };
};

const getWebSocketURL = () => {
  const config = getWebSocketConfig();
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

  if (isLocalhost) {
    return `${config.protocol}://${config.host}:${config.port}${config.path}`;
  }
  
  return `${config.protocol}://${config.host}${config.path}`;
};

module.exports = { getWebSocketConfig, getWebSocketURL };