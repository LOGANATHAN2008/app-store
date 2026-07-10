require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/services/socket');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Apple Store API running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});

module.exports = server;
