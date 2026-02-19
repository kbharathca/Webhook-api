import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'dist')));

// Helper: Read/Write Data
async function getData() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { endpoints: [], requests: [] };
  }
}

async function saveData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * WEBHOOK INGESTION
 * This route catches any request sent to /hooks/:id
 */
app.all('/hooks/:endpointId', async (req, res) => {
  const { endpointId } = req.params;
  const data = await getData();

  const newRequest = {
    id: Math.random().toString(36).substr(2, 9),
    endpointId,
    method: req.method,
    timestamp: Date.now(),
    headers: Object.entries(req.headers).map(([key, value]) => ({ key, value: String(value) })),
    query: req.query,
    body: req.body,
    size: JSON.stringify(req.body).length,
    contentType: req.headers['content-type'] || 'application/json'
  };

  data.requests.unshift(newRequest);
  // Keep last 200 requests to prevent file bloat
  if (data.requests.length > 200) data.requests = data.requests.slice(0, 200);
  
  await saveData(data);

  console.log(`[Webhook] Received ${req.method} for ${endpointId}`);
  res.status(200).json({ status: 'success', received: true });
});

/**
 * ADMIN API
 */
app.get('/api/endpoints', async (req, res) => {
  const data = await getData();
  res.json(data.endpoints);
});

app.post('/api/endpoints', async (req, res) => {
  const data = await getData();
  const newEndpoint = req.body;
  data.endpoints.push(newEndpoint);
  await saveData(data);
  res.status(201).json(newEndpoint);
});

app.delete('/api/endpoints/:id', async (req, res) => {
  const data = await getData();
  data.endpoints = data.endpoints.filter((e: any) => e.id !== req.params.id);
  data.requests = data.requests.filter((r: any) => r.endpointId !== req.params.id);
  await saveData(data);
  res.status(204).end();
});

app.get('/api/requests/:endpointId', async (req, res) => {
  const data = await getData();
  const filtered = data.requests.filter((r: any) => r.endpointId === req.params.endpointId);
  res.json(filtered);
});

app.delete('/api/requests/:endpointId', async (req, res) => {
  const data = await getData();
  data.requests = data.requests.filter((r: any) => r.endpointId !== req.params.endpointId);
  await saveData(data);
  res.status(204).end();
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  🚀 HookMaster Server Running!
  ----------------------------
  Admin UI: http://localhost:${PORT}
  Webhook URL Template: http://localhost:${PORT}/hooks/{endpoint_id}
  ----------------------------
  `);
});