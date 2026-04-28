require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const webRoutes = require('./src/Routes/web');
const apiRoutes = require('./src/Routes/api');
const db = require('./src/Config/DataBase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src/Views')));

// Rotas
app.use('/', webRoutes);
app.use('/api', apiRoutes);

// Rota para SPA - fallback para index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/Views/Home/index.html'));
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// 404
app.use('*', (req, res) => {
    res.status(404).json({ success: false, error: 'Rota não encontrada' });
});

// Iniciar servidor
const server = app.listen(PORT, async () => {
    try {
        await db.connect();
        console.log(`✅ Banco de dados conectado: ${process.env.DB_NAME}`);
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco:', error.message);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM recebido, fechando servidor...');
    server.close(async () => {
        await db.end();
        console.log('Servidor fechado.');
        process.exit(0);
    });
});