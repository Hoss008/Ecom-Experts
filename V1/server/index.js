import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bundleData from './data/bundleData.js';

const app = express();
const port = process.env.PORT || 3001;
const directory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(directory, '../dist');

app.disable('x-powered-by');

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/bundle', (_request, response) => {
  response.json(bundleData);
});

// In production, Express serves the built React app and the API from one origin.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDirectory));
  app.get(/.*/, (_request, response) => {
    response.sendFile(path.join(distDirectory, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Bundle API listening at http://localhost:${port}`);
});
