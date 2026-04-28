const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        if (!this.pool) {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'blog',
                port: parseInt(process.env.DB_PORT) || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                acquireTimeout: 60000,
                timeout: 60000
            });
        }
        return this.pool;
    }

    async getConnection() {
        const pool = await this.connect();
        return await pool.getConnection();
    }

    async query(sql, params = []) {
        const pool = await this.connect();
        try {
            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Erro na query:', error);
            throw error;
        }
    }

    async end() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = new Database();