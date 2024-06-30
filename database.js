const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite'); // Corrected path to SQLite database

db.serialize(() => {
    // Create and populate 'user' table
    db.run("CREATE TABLE IF NOT EXISTS user (id INT, name TEXT)");

    // Create and populate 'test' table
    db.run("CREATE TABLE IF NOT EXISTS test (id INT, name TEXT)"); // Corrected CREATE TABLE syntax
});

module.exports = db;
