const getWebSocketConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    protocol: isDevelopment ? 'ws' : 'wss',
    // Update to use the exact Azure Web App hostname
    host: isDevelopment ? 
      'localhost' : 
      'parkappwebsocket-g5c2hnhpbjg4f5an.canadacentral-01.azurewebsites.net',
    port: isDevelopment ? 8080 : null,
    path: '/ws'  // Remove /api prefix for Web App
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