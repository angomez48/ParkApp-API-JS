const getWebSocketConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    protocol: isDevelopment ? 'ws' : 'wss',
    // Update to use the correct Azure Web App domain
    host: isDevelopment ? 
      'localhost' : 
      'parkappwebsocket.azurewebsites.net',
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