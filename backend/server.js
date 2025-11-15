import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File upload setup
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Database setup
const db = new sqlite3.Database(process.env.DATABASE_PATH || './phcs.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database
const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'staff',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Owners table
    db.run(`
      CREATE TABLE IF NOT EXISTS owners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pets table
    db.run(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        species TEXT,
        breed TEXT,
        age_years INTEGER,
        color TEXT,
        health_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES owners(id)
      )
    `);

    // Cases table
    db.run(`
      CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL,
        pet_id INTEGER,
        status TEXT DEFAULT 'New',
        service_type TEXT,
        assigned_to INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME,
        FOREIGN KEY (owner_id) REFERENCES owners(id),
        FOREIGN KEY (pet_id) REFERENCES pets(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);

    // Case notes table
    db.run(`
      CREATE TABLE IF NOT EXISTS case_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Case files table
    db.run(`
      CREATE TABLE IF NOT EXISTS case_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        file_type TEXT,
        file_size_bytes INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id)
      )
    `);

    // Service assignments table
    db.run(`
      CREATE TABLE IF NOT EXISTS service_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL,
        service_type TEXT NOT NULL,
        assigned_to INTEGER NOT NULL,
        status TEXT DEFAULT 'Assigned',
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);

    // Create demo user
    db.run(`
      INSERT OR IGNORE INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `, ['demo@jhs.org', 'demo123', 'Demo Staff', 'staff']);

    console.log('Database tables initialized');
  });
};

initDatabase();

// Helper: Run async database queries
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// ===== AUTHENTICATION =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await dbGet(
      'SELECT * FROM users WHERE email = ? AND password_hash = ?',
      [email, password]
    );

    if (user) {
      res.json({
        user_id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token: `token-${user.id}`
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// ===== CASES =====
app.get('/api/cases', async (req, res) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT c.*, o.name as owner_name, o.phone as owner_phone, p.name as pet_name
      FROM cases c
      JOIN owners o ON c.owner_id = o.id
      LEFT JOIN pets p ON c.pet_id = p.id
      WHERE c.status != 'Archived'
    `;
    let params = [];
    
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY c.created_at DESC LIMIT 100';
    
    const cases = await dbAll(sql, params);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases', async (req, res) => {
  try {
    const { owner_name, owner_phone, owner_email, pet_name, pet_species, service_type } = req.body;

    // Create or get owner
    let owner = await dbGet('SELECT * FROM owners WHERE phone = ? LIMIT 1', [owner_phone]);
    
    if (!owner) {
      const ownerRes = await dbRun(
        'INSERT INTO owners (name, phone, email) VALUES (?, ?, ?)',
        [owner_name, owner_phone, owner_email]
      );
      owner = { id: ownerRes.id };
    }

    // Create pet if name provided
    let petId = null;
    if (pet_name) {
      const petRes = await dbRun(
        'INSERT INTO pets (owner_id, name, species) VALUES (?, ?, ?)',
        [owner.id, pet_name, pet_species || 'Unknown']
      );
      petId = petRes.id;
    }

    // Create case
    const caseRes = await dbRun(
      'INSERT INTO cases (owner_id, pet_id, service_type, status) VALUES (?, ?, ?, ?)',
      [owner.id, petId, service_type, 'New']
    );

    const newCase = await dbGet(
      `SELECT c.*, o.name as owner_name, o.phone as owner_phone, p.name as pet_name
       FROM cases c
       JOIN owners o ON c.owner_id = o.id
       LEFT JOIN pets p ON c.pet_id = p.id
       WHERE c.id = ?`,
      [caseRes.id]
    );

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cases/:id', async (req, res) => {
  try {
    const caseData = await dbGet(
      `SELECT c.*, o.name as owner_name, o.phone as owner_phone, o.email as owner_email, o.address, 
              p.name as pet_name, p.species as pet_species, p.breed, p.age_years, p.color, p.health_notes
       FROM cases c
       JOIN owners o ON c.owner_id = o.id
       LEFT JOIN pets p ON c.pet_id = p.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Get notes
    const notes = await dbAll(
      'SELECT * FROM case_notes WHERE case_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    // Get files
    const files = await dbAll(
      'SELECT * FROM case_files WHERE case_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    // Get service assignments
    const services = await dbAll(
      'SELECT * FROM service_assignments WHERE case_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({
      ...caseData,
      notes,
      files,
      services
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cases/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'Closed') {
        updates.push('closed_at = CURRENT_TIMESTAMP');
      }
    }

    if (notes) {
      updates.push('notes = ?');
      params.push(notes);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    if (updates.length > 1) {
      await dbRun(
        `UPDATE cases SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    const updated = await dbGet(
      `SELECT c.*, o.name as owner_name, p.name as pet_name
       FROM cases c
       JOIN owners o ON c.owner_id = o.id
       LEFT JOIN pets p ON c.pet_id = p.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CASE NOTES =====
app.post('/api/cases/:case_id/notes', async (req, res) => {
  try {
    const { text } = req.body;
    const created_by = req.body.user_id || 1; // Default to user 1 for hackathon

    const result = await dbRun(
      'INSERT INTO case_notes (case_id, text, created_by) VALUES (?, ?, ?)',
      [req.params.case_id, text, created_by]
    );

    const note = await dbGet(
      'SELECT * FROM case_notes WHERE id = ?',
      [result.id]
    );

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cases/:case_id/notes', async (req, res) => {
  try {
    const notes = await dbAll(
      'SELECT * FROM case_notes WHERE case_id = ? ORDER BY created_at DESC',
      [req.params.case_id]
    );
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CASE FILES =====
app.post('/api/cases/:case_id/files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await dbRun(
      'INSERT INTO case_files (case_id, filename, filepath, file_type, file_size_bytes) VALUES (?, ?, ?, ?, ?)',
      [
        req.params.case_id,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size
      ]
    );

    const file = await dbGet(
      'SELECT * FROM case_files WHERE id = ?',
      [result.id]
    );

    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cases/:case_id/files', async (req, res) => {
  try {
    const files = await dbAll(
      'SELECT * FROM case_files WHERE case_id = ? ORDER BY created_at DESC',
      [req.params.case_id]
    );
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/files/:id/download', async (req, res) => {
  try {
    const file = await dbGet('SELECT * FROM case_files WHERE id = ?', [req.params.id]);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(file.filepath, file.filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DASHBOARD =====
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const totalCases = await dbGet(
      'SELECT COUNT(*) as count FROM cases WHERE status != "Archived"'
    );

    const casesByStatus = await dbAll(
      'SELECT status, COUNT(*) as count FROM cases WHERE status != "Archived" GROUP BY status'
    );

    const casesByService = await dbAll(
      'SELECT service_type, COUNT(*) as count FROM cases WHERE status != "Archived" GROUP BY service_type'
    );

    const avgDuration = await dbGet(
      `SELECT AVG(CAST((julianday(COALESCE(closed_at, CURRENT_TIMESTAMP)) - julianday(created_at)) AS FLOAT)) as days
       FROM cases WHERE status != "Archived"`
    );

    const recentCases = await dbAll(
      `SELECT c.id, c.status, c.service_type, o.name as owner_name, p.name as pet_name, c.created_at
       FROM cases c
       JOIN owners o ON c.owner_id = o.id
       LEFT JOIN pets p ON c.pet_id = p.id
       WHERE c.status != "Archived"
       ORDER BY c.created_at DESC
       LIMIT 10`
    );

    res.json({
      summary: {
        active_cases: totalCases.count,
        avg_duration_days: avgDuration.days ? Math.round(avgDuration.days) : 0
      },
      status_distribution: casesByStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}),
      service_distribution: casesByService.reduce((acc, item) => {
        acc[item.service_type] = item.count;
        return acc;
      }, {}),
      recent_cases: recentCases
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PHCS Backend running on http://localhost:${PORT}`);
  console.log(`📧 Demo login: demo@jhs.org / demo123`);
});
