const getWebSocketConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    protocol: isDevelopment ? 'ws' : 'wss',
    host: isDevelopment ? 'localhost' : 'witty-beach-062ca4b10.3.azurestaticapps.net',
    port: isDevelopment ? 8080 : null,
    path: '/ws'
  };
};

module.exports = { getWebSocketConfig };