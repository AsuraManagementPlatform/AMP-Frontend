import handler from 'serve-handler';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = parseInt(process.env.PORT || '3000', 10);
const publicPath = 'dist';
const fullPath = path.join(__dirname, publicPath);

if (!fs.existsSync(fullPath)) {
  console.error(`ERROR: The "${publicPath}" directory does not exist!`);
  process.exit(1);
}

// Create compression middleware
const compress = compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

const server = http.createServer((request, response) => {
  compress(request, response, () => {
    if (request.url === '/health' || request.url === '/healthz') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }
    
    response.on('error', (err) => {
      console.error('Response error:', err);
    });
    
    try {
      const result = handler(request, response, {
        public: publicPath,
        rewrites: [
          { source: '/**', destination: '/index.html' }
        ],
        headers: [
          {
            source: '**/*.@(js|css|svg|png|jpg|jpeg|webp|woff|woff2)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable'
              }
            ]
          },
          {
            source: 'index.html',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=0, must-revalidate'
              }
            ]
          }
        ]
      });
      
      if (result && typeof result.then === 'function') {
        result.catch((err) => {
          console.error('Handler error:', err);
        });
      }
      
      return result;
    } catch (error) {
      console.error('Handler error:', error.message);
      if (!response.headersSent) {
        response.statusCode = 500;
        response.setHeader('Content-Type', 'text/plain');
        response.end(`Server Error: ${error.message}`);
      }
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});

server.on('error', (error) => {
  console.error('Server error:', error.code);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.close(() => console.log('Server closed'));
});

process.on('SIGINT', () => {
  server.close(() => console.log('Server closed'));
});