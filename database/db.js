const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/users.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        perfil TEXT NOT NULL CHECK(perfil IN ('ADMIN', 'CLIENTE'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS telefones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        telefone TEXT NOT NULL,
        principal BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        email TEXT NOT NULL,
        principal BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
});

module.exports = db;
