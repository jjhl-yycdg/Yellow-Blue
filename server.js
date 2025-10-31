const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOAD_DIR); },
  filename: function (req, file, cb) {
    // prefix with timestamp to avoid collisions
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, Date.now() + '_' + safe);
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } });

const app = express();
app.use(cors());

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR, { index: false }));

// Simple health
app.get('/ping', (req, res) => res.json({ ok: true }));

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if(!req.file) return res.status(400).json({ error: 'no_file' });
  const filename = req.file.filename;
  const url = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(filename)}`;
  res.json({ url });
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>{ console.log('Upload server listening on http://0.0.0.0:' + port); });
