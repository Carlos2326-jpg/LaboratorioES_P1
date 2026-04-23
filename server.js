// server.js
require('dotenv').config(); // Carrega as variáveis PRIMEIRO

const express = require('express');
const db = require('./src/Config/database'); // ou onde estiver sua conexão

const app = express();
const PORT = process.env.PORT || 3000;

// Exemplo de rota que usa o banco
app.get('/usuarios', async (req, res) => {
    try {
        // Se usou conexão normal:
        db.query('SELECT * FROM usuarios', (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Conectando ao banco: ${process.env.DB_NAME}`);
});