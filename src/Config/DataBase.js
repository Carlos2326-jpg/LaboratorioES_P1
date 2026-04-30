const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        if (this.pool) return this.pool;

        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'BlogNoticias',
            port: parseInt(process.env.DB_PORT) || 3306,
            waitForConnections: true,
            connectionLimit: 20,
            queueLimit: 0,
            acquireTimeout: 60000,
            timeout: 60000,
            charset: 'utf8mb4'
        });

        // Testar conexão
        try {
            await this.pool.getConnection();
            console.log('✅ Pool de conexão criado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao criar pool:', error.message);
            throw error;
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
            console.error('❌ Erro na query:', error.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw error;
        }
    }

    async transaction(callback) {
        const connection = await this.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async end() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

module.exports = new Database();