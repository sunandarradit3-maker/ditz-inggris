/*
 * DiTz Store - Simple full‑stack server for an international English learning
 * website. This server uses Node’s built‑in http and fs modules to serve
 * static files and a basic translation API. It does not depend on any
 * external packages so it can run in restricted environments. The API
 * endpoint `/api/translate?word=<word>&lang=<language>` provides
 * translations of a small set of common English words into multiple
 * languages defined in `translations.json`. Additional words and
 * languages can be added by editing that file.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load translation dictionary at startup. The file maps English words to
// their equivalents in supported languages. See translations.json for
// structure. If the file cannot be read, an empty object is used.
let translations = {};
try {
  const raw = fs.readFileSync(path.join(__dirname, 'translations.json'), 'utf8');
  translations = JSON.parse(raw);
} catch (err) {
  console.error('Warning: Could not load translations.json:', err);
  translations = {};
}

/**
 * Returns the MIME type based on file extension. Extend this list
 * for additional file types as needed.
 * @param {string} ext The file extension (e.g. '.js')
 */
function getMimeType(ext) {
  switch (ext) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'text/plain';
  }
}

/**
 * Handles requests for translating a word into another language.
 * Query parameters:
 *   word – the English word to translate (case insensitive)
 *   lang – target language code (e.g. 'id', 'es', 'fr', 'zh')
 * If the word or language is not found, returns an object with an
 * `error` message.
 * @param {url.URL} urlObj Parsed URL object
 * @param {http.ServerResponse} res Response object
 */
function handleTranslateRequest(urlObj, res) {
  const wordParam = (urlObj.searchParams.get('word') || '').toLowerCase();
  const lang = (urlObj.searchParams.get('lang') || '').toLowerCase();
  const entry = translations[wordParam];
  let responseData;
  if (!entry) {
    responseData = { error: `Translation for "${wordParam}" not found.` };
  } else if (!entry[lang]) {
    responseData = { error: `Language "${lang}" not supported for word "${wordParam}".` };
  } else {
    responseData = { word: wordParam, lang: lang, translation: entry[lang] };
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(responseData));
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);

  // API route
  if (urlObj.pathname === '/api/translate') {
    return handleTranslateRequest(urlObj, res);
  }

  // Serve static files from the public directory
  let filePath = path.join(__dirname, 'public', decodeURIComponent(urlObj.pathname));
  if (fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }
    res.writeHead(200, { 'Content-Type': getMimeType(ext) });
    res.end(data);
  });
});

// Start server on port 3000. The port can be changed if necessary.
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`DiTz Store server is running at http://localhost:${PORT}`);
});