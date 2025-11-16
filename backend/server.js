import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

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
        owner_name TEXT,
        owner_phone TEXT,
        owner_email TEXT,
        pet_name TEXT,
        pet_species TEXT,
        breed TEXT,
        status TEXT DEFAULT 'open',
        service_type TEXT,
        owner_id INTEGER,
        pet_id INTEGER,
        assigned_to INTEGER,
        notes TEXT,
        is_deleted INTEGER DEFAULT 0,
        deleted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME,
        FOREIGN KEY (owner_id) REFERENCES owners(id),
        FOREIGN KEY (pet_id) REFERENCES pets(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);

    // Add missing columns if they don't exist
    db.run(`ALTER TABLE cases ADD COLUMN owner_name TEXT`, () => {});
    db.run(`ALTER TABLE cases ADD COLUMN owner_phone TEXT`, () => {});
    db.run(`ALTER TABLE cases ADD COLUMN owner_email TEXT`, () => {});
    db.run(`ALTER TABLE cases ADD COLUMN pet_name TEXT`, () => {});
    db.run(`ALTER TABLE cases ADD COLUMN pet_species TEXT`, () => {});
    db.run(`ALTER TABLE cases ADD COLUMN breed TEXT`, () => {});

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
      WHERE c.status != 'Archived' AND c.is_deleted = 0
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

// ===== CASE SEARCH =====
app.get('/api/cases/search/by-contact', async (req, res) => {
  try {
    const { phone, name } = req.query;
    if (!phone && !name) {
      return res.status(400).json({ error: 'Phone or name required' });
    }

    let sql = `
      SELECT c.*, o.name as owner_name, o.phone as owner_phone, p.name as pet_name
      FROM cases c
      JOIN owners o ON c.owner_id = o.id
      LEFT JOIN pets p ON c.pet_id = p.id
      WHERE c.is_deleted = 0
    `;
    const params = [];

    if (phone) {
      sql += ' AND o.phone LIKE ?';
      params.push(`%${phone}%`);
    }
    if (name) {
      sql += ' AND o.name LIKE ?';
      params.push(`%${name}%`);
    }

    sql += ' ORDER BY c.created_at DESC LIMIT 100';
    const results = await dbAll(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SOFT DELETE & RECOVERY =====
app.delete('/api/cases/:id', async (req, res) => {
  try {
    await dbRun(
      'UPDATE cases SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Case deleted (soft delete)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases/:id/recover', async (req, res) => {
  try {
    await dbRun(
      'UPDATE cases SET is_deleted = 0, deleted_at = NULL WHERE id = ?',
      [req.params.id]
    );
    const recovered = await dbGet(
      `SELECT c.*, o.name as owner_name, p.name as pet_name
       FROM cases c
       JOIN owners o ON c.owner_id = o.id
       LEFT JOIN pets p ON c.pet_id = p.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    res.json(recovered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GET DELETED CASES =====
app.get('/api/cases/deleted/list', async (req, res) => {
  try {
    const deleted = await dbAll(
      `SELECT c.*, o.name as owner_name, o.phone as owner_phone, p.name as pet_name
       FROM cases c
       JOIN owners o ON c.owner_id = o.id
       LEFT JOIN pets p ON c.pet_id = p.id
       WHERE c.is_deleted = 1
       ORDER BY c.deleted_at DESC LIMIT 50`
    );
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cases/:id', async (req, res) => {
  try {
    const { status, notes, owner_name, owner_phone, owner_email, pet_name, pet_species, breed, service_type } = req.body;
    const updates = [];
    const params = [];

    // Update case status and service type
    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'Closed') {
        updates.push('closed_at = CURRENT_TIMESTAMP');
      }
    }

    if (service_type) {
      updates.push('service_type = ?');
      params.push(service_type);
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

    // Update owner details if provided
    if (owner_name || owner_phone || owner_email) {
      const caseData = await dbGet('SELECT owner_id FROM cases WHERE id = ?', [req.params.id]);
      if (caseData) {
        const ownerUpdates = [];
        const ownerParams = [];
        
        if (owner_name) {
          ownerUpdates.push('name = ?');
          ownerParams.push(owner_name);
        }
        if (owner_phone) {
          ownerUpdates.push('phone = ?');
          ownerParams.push(owner_phone);
        }
        if (owner_email) {
          ownerUpdates.push('email = ?');
          ownerParams.push(owner_email);
        }
        
        ownerParams.push(caseData.owner_id);
        if (ownerUpdates.length > 0) {
          await dbRun(
            `UPDATE owners SET ${ownerUpdates.join(', ')} WHERE id = ?`,
            ownerParams
          );
        }
      }
    }

    // Update pet details if provided
    if (pet_name || pet_species || breed) {
      const caseData = await dbGet('SELECT pet_id FROM cases WHERE id = ?', [req.params.id]);
      if (caseData && caseData.pet_id) {
        const petUpdates = [];
        const petParams = [];
        
        if (pet_name) {
          petUpdates.push('name = ?');
          petParams.push(pet_name);
        }
        if (pet_species) {
          petUpdates.push('species = ?');
          petParams.push(pet_species);
        }
        if (breed) {
          petUpdates.push('breed = ?');
          petParams.push(breed);
        }
        
        petParams.push(caseData.pet_id);
        if (petUpdates.length > 0) {
          await dbRun(
            `UPDATE pets SET ${petUpdates.join(', ')} WHERE id = ?`,
            petParams
          );
        }
      }
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

// ===== BULK DATA IMPORT =====
app.post('/api/import/preview', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const previewData = [];

    for (const file of req.files) {
      const filePath = file.path;
      const fileName = file.originalname;
      const ext = path.extname(fileName).toLowerCase();

      try {
        let records = [];
        
        if (ext === '.csv') {
          const fileContent = readFileSync(filePath, 'utf-8');
          records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
          });
        } else if (ext === '.json') {
          const fileContent = readFileSync(filePath, 'utf-8');
          records = JSON.parse(fileContent);
          if (!Array.isArray(records)) records = [records];
        } else {
          previewData.push({
            fileName,
            status: 'error',
            error: 'Unsupported file format. Only CSV and JSON are supported.',
            records: []
          });
          fs.unlinkSync(filePath);
          continue;
        }

        // Normalize and validate records
        const normalizedRecords = records.map((record, idx) => ({
          ...record,
          _index: idx,
          _errors: validateCaseRecord(record)
        }));

        previewData.push({
          fileName,
          status: normalizedRecords.some(r => r._errors.length > 0) ? 'warning' : 'ok',
          recordCount: normalizedRecords.length,
          records: normalizedRecords,
          _filePath: filePath
        });
      } catch (parseError) {
        previewData.push({
          fileName,
          status: 'error',
          error: parseError.message,
          records: []
        });
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      previewData,
      totalRecords: previewData.reduce((sum, f) => sum + (f.records?.length || 0), 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate case record
const validateCaseRecord = (record) => {
  const errors = [];
  
  // Required fields
  const required = ['owner_name', 'owner_phone', 'pet_name', 'service_type'];
  required.forEach(field => {
    if (!record[field] || !String(record[field]).trim()) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate phone format (basic)
  if (record.owner_phone) {
    const phoneStr = String(record.owner_phone).trim();
    if (phoneStr.length < 7) {
      errors.push('Invalid phone number (too short)');
    }
  }

  return errors;
};

// Confirm import
app.post('/api/import/confirm', async (req, res) => {
  try {
    const { records, fileNames } = req.body;

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'No records to import' });
    }

    let importedCount = 0;
    const errors = [];

    for (const record of records) {
      try {
        // Skip records with errors
        if (record._errors && record._errors.length > 0) {
          errors.push(`Row ${record._index + 1}: ${record._errors.join(', ')}`);
          continue;
        }

        // Create owner
        const ownerResult = await dbRun(
          `INSERT OR IGNORE INTO owners (name, phone, email) VALUES (?, ?, ?)`,
          [
            record.owner_name || '',
            record.owner_phone || '',
            record.owner_email || ''
          ]
        );

        const ownerRow = await dbGet(
          `SELECT id FROM owners WHERE phone = ? OR name = ?`,
          [record.owner_phone || '', record.owner_name || '']
        );

        if (!ownerRow) {
          errors.push(`Row ${record._index + 1}: Failed to create/find owner`);
          continue;
        }

        // Create pet if details provided
        let petId = null;
        if (record.pet_name) {
          const petResult = await dbRun(
            `INSERT INTO pets (name, species, breed, owner_id) VALUES (?, ?, ?, ?)`,
            [
              record.pet_name,
              record.pet_species || 'Unknown',
              record.breed || '',
              ownerRow.id
            ]
          );
          petId = petResult.id;
        }

        // Create case
        await dbRun(
          `INSERT INTO cases (
            owner_id, pet_id, service_type, status, notes, created_at, updated_at, is_deleted
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)`,
          [
            ownerRow.id,
            petId,
            record.service_type || '',
            record.status || 'New',
            record.notes || ''
          ]
        );

        importedCount++;
      } catch (recordError) {
        errors.push(`Row ${record._index + 1}: ${recordError.message}`);
      }
    }

    res.json({
      importedCount,
      totalRecords: records.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${importedCount} cases`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== IMPORT CONFIRMATION ENDPOINT =====
app.post('/api/import/confirm', async (req, res) => {
  try {
    const { importData } = req.body;
    
    if (!Array.isArray(importData) || importData.length === 0) {
      return res.status(400).json({ error: 'No data to import' });
    }

    let importedCount = 0;
    const errors = [];

    for (let idx = 0; idx < importData.length; idx++) {
      const item = importData[idx];
      try {
        await dbRun(
          `INSERT INTO cases (owner_name, owner_phone, owner_email, pet_name, pet_species, breed, service_type, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'open', datetime('now'))`,
          [
            item.contact_name || '',
            item.phone_number || '',
            item.email || '',
            item.pet_name || '',
            item.pet_species || item.species || '',
            item.breed || '',
            item.service_type || ''
          ]
        );
        importedCount++;
      } catch (err) {
        errors.push({ index: idx, record: item, error: err.message });
      }
    }

    res.json({
      success: true,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${importedCount} cases`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DASHBOARD STATISTICS =====
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Total cases
    const totalCases = await dbGet('SELECT COUNT(*) as count FROM cases WHERE is_deleted = 0', []);
    
    // Active cases (status = open)
    const activeCases = await dbGet("SELECT COUNT(*) as count FROM cases WHERE status = 'open' AND is_deleted = 0", []);
    
    // Cases by status
    const casesByStatus = await dbAll(`
      SELECT status, COUNT(*) as count 
      FROM cases 
      WHERE is_deleted = 0
      GROUP BY status
    `, []);
    
    // Top service types
    const topServices = await dbAll(`
      SELECT service_type, COUNT(*) as count 
      FROM cases 
      WHERE is_deleted = 0 AND service_type != ''
      GROUP BY service_type 
      ORDER BY count DESC 
      LIMIT 5
    `, []);
    
    // Top species
    const topSpecies = await dbAll(`
      SELECT pet_species, COUNT(*) as count 
      FROM cases 
      WHERE is_deleted = 0 AND pet_species != ''
      GROUP BY pet_species 
      ORDER BY count DESC 
      LIMIT 5
    `, []);
    
    // This month's cases
    const thisMonthCases = await dbGet(`
      SELECT COUNT(*) as count 
      FROM cases 
      WHERE is_deleted = 0 
      AND date(created_at) >= date('now', 'start of month')
    `, []);
    
    res.json({
      totalCases: totalCases?.count || 0,
      activeCases: activeCases?.count || 0,
      thisMonthCases: thisMonthCases?.count || 0,
      casesByStatus: (casesByStatus || []).map(s => ({ status: s.status, count: s.count })),
      topServices: (topServices || []).map(s => ({ service: s.service_type, count: s.count })),
      topSpecies: (topSpecies || []).map(s => ({ species: s.pet_species, count: s.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== USER MANAGEMENT (Admin Only) =====
app.get('/api/admin/users', async (req, res) => {
  try {
    const userRole = req.query.userRole || 'staff'; // Check auth in production
    
    // In production, verify userRole is 'admin'
    const users = await dbAll('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC', []);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { email, name, role } = req.body;
    
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields: email, name, role' });
    }
    
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or staff' });
    }
    
    // Default password is email for new users
    const defaultPassword = email;
    
    await dbRun(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, defaultPassword, name, role]
    );
    
    res.json({ success: true, message: `User ${email} created with role ${role}` });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    
    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    await dbRun(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    
    res.json({ success: true, message: `User updated to role ${role}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting the demo user or last admin
    const user = await dbGet('SELECT role FROM users WHERE id = ?', [id]);
    
    if (user.role === 'admin') {
      const adminCount = await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "admin"', []);
      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }
    
    await dbRun('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbGet('SELECT email FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Reset password to email
    const resetPassword = user.email;
    await dbRun('UPDATE users SET password_hash = ? WHERE id = ?', [resetPassword, id]);
    
    res.json({ success: true, message: `Password reset for ${user.email}. New password: ${resetPassword}` });
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
