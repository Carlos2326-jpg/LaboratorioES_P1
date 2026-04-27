// Carrega as variáveis do arquivo .env
require('dotenv').config();

const mysql = require('mysql2');

// Usa as variáveis de ambiente
const connection = mysql.createConnection({
    host: process.env.DB_HOST,        // lê do .env
    user: process.env.DB_USER,        // lê do .env
    password: process.env.DB_PASSWORD, // lê do .env (seguro!)
    database: process.env.DB_NAME,     // lê do .env
    port: process.env.DB_PORT || 3306  // usa padrão se não existir
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar:', err.message);
        return;
    }
    console.log('✅ Conectado ao banco:', process.env.DB_NAME);
});

module.exports = connection;