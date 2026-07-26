import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

const PROGRESS_FILE = 'data/progress.json';

export function progressPlugin(): Plugin {
  return {
    name: 'progress-plugin',

    configureServer(server) {
      // Ensure data directory exists
      const dataDir = path.resolve('data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // GET - Load progress
      server.middlewares.use('/api/progress', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const filePath = path.resolve(PROGRESS_FILE);
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, 'utf8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end('null');
            }
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read progress' }));
          }
          return;
        }
        next();
      });

      // POST - Save progress
      server.middlewares.use('/api/progress', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const filePath = path.resolve(PROGRESS_FILE);
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
              console.log(`\n✓ Progress saved to ${PROGRESS_FILE}`);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save progress' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}
