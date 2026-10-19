import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function setupStaticFiles(app) {
  const publicDir = path.join(__dirname, '../public');
  const indexPath = path.join(publicDir, 'index.html');

  console.log(`📂 Public dir: ${publicDir}`);
  console.log(`📂 Public dir exists: ${fs.existsSync(publicDir)}`);
  console.log(`📄 index.html exists: ${fs.existsSync(indexPath)}`);

  // Serve index.html directly for root
  app.get('/', (req, res) => {
    console.log(`📄 Serving index.html from: ${indexPath}`);
    if (fs.existsSync(indexPath)) {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(fs.readFileSync(indexPath, 'utf8'));
    } else {
      res.status(404).send('index.html not found');
    }
  });

  // Serve other static files
  app.use(express.static(publicDir));
}
