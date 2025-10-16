import handler from 'serve-handler';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = parseInt(process.env.PORT || '3000', 10);
const publicPath = 'dist';
const fullPath = path.join(__dirname, publicPath);

console.log('=== Server Startup Diagnostics ===');
console.log('PORT:', port);
console.log('Working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Public path:', publicPath);
console.log('Full path:', fullPath);
console.log('Path exists:', fs.existsSync(fullPath));

if (!fs.existsSync(fullPath)) {
  console.error(`ERROR: The "${publicPath}" directory does not exist!`);
  console.error('Please run "npm run build" before starting the server.');
  process.exit(1);
}

const files = fs.readdirSync(fullPath);
console.log('Files in dist:', files);

const indexPath = path.join(fullPath, 'index.html');
console.log('index.html exists:', fs.existsSync(indexPath));

const server = http.createServer((request, response) => {
  console.log('=== Incoming Request ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${request.method}`);
  console.log(`URL: ${request.url}`);
  console.log(`Headers:`, JSON.stringify(request.headers, null, 2));
  
  // Add a basic health check endpoint
  if (request.url === '/health' || request.url === '/healthz') {
    console.log('Health check endpoint hit - responding with 200');
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    console.log('Health check response sent');
    return;
  }
  
  console.log('Passing request to serve-handler...');
  console.log(`Handler config - public: ${publicPath}`);
  
  // Track when the handler completes
  response.on('finish', () => {
    console.log(`Response finished - Status: ${response.statusCode}`);
  });
  
  response.on('error', (err) => {
    console.error('Response error:', err);
  });
  
  try {
    const result = handler(request, response, {
      public: publicPath,
      rewrites: [
        { source: '/**', destination: '/index.html' }
      ]
    });
    
    console.log('Handler invoked, result:', result);
    
    if (result && typeof result.then === 'function') {
      result.then(() => {
        console.log('Handler promise resolved');
      }).catch((err) => {
        console.error('Handler promise rejected:', err);
      });
    }
    
    return result;
  } catch (error) {
    console.error('!!! Handler threw synchronous error:', error);
    console.error('Error stack:', error.stack);
    if (!response.headersSent) {
      response.statusCode = 500;
      response.setHeader('Content-Type', 'text/plain');
      response.end(`Server Error: ${error.message}`);
    }
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log('=== Server Started Successfully ===');
  console.log(`✅ Server running at http://0.0.0.0:${port}`);
  console.log('Server is ready to accept connections');
  console.log(`Process ID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'not set'}`);
});

server.on('connection', (socket) => {
  console.log('New connection established from:', socket.remoteAddress);
});

server.on('error', (error) => {
  console.error('!!! Server error:', error);
  console.error('Error code:', error.code);
  console.error('Error stack:', error.stack);
  process.exit(1);
});

server.on('close', () => {
  console.log('Server closed');
});

process.on('uncaughtException', (error) => {
  console.error('!!! Uncaught Exception !!!');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('Type:', error.name);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('!!! Unhandled Rejection !!!');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  if (reason && reason.stack) {
    console.error('Stack:', reason.stack);
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

console.log('=== Process Error Handlers Registered ===');