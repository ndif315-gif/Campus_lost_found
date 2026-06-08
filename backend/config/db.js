const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file path - support both local development and production (Render)
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '..', 'database.sqlite');

// Ensure directory exists for production paths
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    try {
        fs.mkdirSync(dbDir, { recursive: true });
    } catch (error) {
        console.error('Error creating database directory:', error);
    }
}

/**
 * Initialize the SQLite database
 */
const db = new Database(dbPath, { verbose: null });
db.pragma('journal_mode = WAL');

/**
 * Initialize Schema
 */
const initDb = () => {
    try {
        const schemaPath = path.join(__dirname, '..', 'database.sql');
        if (!fs.existsSync(schemaPath)) {
            console.error('Schema file not found at:', schemaPath);
            return;
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // SQLite adjustments from MySQL schema
        const sqliteSchema = schema
            .replace(/CREATE DATABASE IF NOT EXISTS[^;]+;/g, '')
            .replace(/USE [^;]+;/g, '')
            .replace(/INT AUTO_INCREMENT PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .replace(/INT\(/g, 'INTEGER(')
            .replace(/LONGTEXT/g, 'TEXT')
            .replace(/ENUM\([^)]+\)/g, 'TEXT')
            .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
            .replace(/TIMESTAMP/g, 'DATETIME')
            .replace(/FULLTEXT INDEX [^;]+;/g, '')
            .replace(/INDEX /g, '-- INDEX ')
            .replace(/ON UPDATE CURRENT_TIMESTAMP/g, '');

        db.exec(sqliteSchema);
        console.log('SQLite database initialized successfully');
    } catch (error) {
        if (error.message.includes('already exists')) {
            // Tables already exist, we can ignore this during init
            return;
        }
        console.error('Error initializing database:', error);
    }
};

// Run init
initDb();

// Add helper methods to match previous mysql2 expectations where needed
db.execute = (query, params = []) => {
    const stmt = db.prepare(query);
    if (query.trim().toLowerCase().startsWith('select')) {
        const rows = stmt.all(params);
        return [rows]; // Wrap in array to match mysql2 [rows, fields] return
    } else {
        const info = stmt.run(params);
        return [info];
    }
};

module.exports = db;