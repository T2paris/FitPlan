const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ override: true });

const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fittracker_db'
};

let pool = null;
let sqliteDb = null;
let activeType = 'sqlite';

async function initDB() {
    if (dbType === 'mysql') {
        try {
            console.log("Attempting to connect to MySQL database...");
            const connection = await mysql.createConnection({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password
            });
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
            await connection.end();

            pool = mysql.createPool({
                ...dbConfig,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            activeType = 'mysql';
            console.log(`Connected to MySQL server at ${dbConfig.host} [DB: ${dbConfig.database}]`);
            await setupTables();
            return;
        } catch (err) {
            console.warn(`MySQL connection failed: ${err.message}. Falling back to SQLite local database...`);
        }
    }

    // Inicialização do SQLite (como fallback ou por opção padrão)
    activeType = 'sqlite';
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
    console.log(`Using SQLite local database at: ${dbPath}`);
    await setupTables();
}

async function setupTables() {
    const sqlUsers = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `;

    const sqlProfiles = `
        CREATE TABLE IF NOT EXISTS profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            age INT DEFAULT NULL,
            weight DECIMAL(5,2) DEFAULT NULL,
            height DECIMAL(5,2) DEFAULT NULL,
            sport VARCHAR(50) DEFAULT NULL,
            custom_sport VARCHAR(100) DEFAULT NULL,
            experience VARCHAR(50) DEFAULT NULL,
            goals TEXT DEFAULT NULL,
            injuries TEXT DEFAULT NULL,
            injury_details TEXT DEFAULT NULL,
            days_per_week INT DEFAULT NULL,
            hours_per_session DECIMAL(3,1) DEFAULT NULL,
            budget VARCHAR(50) DEFAULT NULL,
            equipment VARCHAR(100) DEFAULT NULL,
            notes TEXT DEFAULT NULL,
            target_vert INT DEFAULT NULL,
            target_weight INT DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `;

    const sqlPlans = `
        CREATE TABLE IF NOT EXISTS plans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            plan_json LONGTEXT DEFAULT NULL,
            week INT DEFAULT 1,
            open_sections_json TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `;

    const sqlChecks = `
        CREATE TABLE IF NOT EXISTS checks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            check_key VARCHAR(150) NOT NULL,
            checked BOOLEAN DEFAULT TRUE,
            UNIQUE (user_id, check_key),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `;

    const sqlStats = `
        CREATE TABLE IF NOT EXISTS stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(20) NOT NULL,
            date_label VARCHAR(20) NOT NULL,
            value DECIMAL(5,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `;

    const sqlChatMessages = `
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            sender VARCHAR(10) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `;

    await query(sqlUsers);
    await query(sqlProfiles);
    await query(sqlPlans);
    await query(sqlChecks);
    await query(sqlStats);
    await query(sqlChatMessages);
    console.log('Database tables successfully verified and initialized.');
}

async function query(sql, params = []) {
    if (activeType === 'mysql') {
        return pool.query(sql, params);
    }

    // Abstração de Query para o SQLite
    let cleanSQL = sql
        .replace(/ENGINE=InnoDB/gi, "")
        .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
        .replace(/DECIMAL\(\d+,\d+\)/gi, "NUMERIC")
        .replace(/LONGTEXT/gi, "TEXT")
        .replace(/ON UPDATE CURRENT_TIMESTAMP/gi, "");

    return new Promise((resolve, reject) => {
        const cleanTrim = cleanSQL.trim().toLowerCase();
        const isSelect = cleanTrim.startsWith('select');
        
        if (isSelect) {
            sqliteDb.all(cleanSQL, params, (err, rows) => {
                if (err) {
                    console.error("SQLite query error:", err, "SQL:", cleanSQL);
                    reject(err);
                } else {
                    resolve([rows]);
                }
            });
        } else {
            sqliteDb.run(cleanSQL, params, function(err) {
                if (err) {
                    console.error("SQLite execution error:", err, "SQL:", cleanSQL);
                    reject(err);
                } else {
                    resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
                }
            });
        }
    });
}

module.exports = {
    initDB,
    query,
    activeType: () => activeType
};
