const getWebSocketConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    protocol: isDevelopment ? 'ws' : 'wss',
    host: isDevelopment ? 'localhost' : 'yourapp.azurewebsites.net',
    port: isDevelopment ? 8080 : null,
    path: '/ws'
  };
};

module.exports = { getWebSocketConfig };