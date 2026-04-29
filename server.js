require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const webRoutes = require('./src/Routes/web');
const apiRoutes = require('./src/Routes/api');
const db = require('./src/Config/DataBase');

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARES BÁSICOS ===
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// === STATIC FILES ===
app.use(express.static(path.join(__dirname, 'src/Views'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// === ROTAS ===
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// === TRATAMENTO DE ERROS ===
app.use((err, req, res, next) => {
    console.error('❌ ERRO [' + new Date().toISOString() + ']:', err.message);
    console.error('Stack:', err.stack);
    
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Erro interno do servidor' 
            : err.message
    });
});

// === 404 FALLBACK ===
app.use('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            success: false, 
            error: 'Endpoint não encontrado' 
        });
    }
    // Redireciona para login qualquer página não encontrada
    res.redirect('/usuario/login');
});

// === INICIALIZAÇÃO ===
const server = app.listen(PORT, async () => {
    try {
        await db.connect();
        console.log('\n🚀 === BLOG DE NOTÍCIAS MVC ===');
        console.log(`✅ Servidor: http://localhost:${PORT}`);
        console.log(`✅ API: http://localhost:${PORT}/api`);
        console.log(`✅ Login: http://localhost:${PORT}/usuario/login`);
        console.log(`✅ Banco: ${process.env.DB_NAME || 'BlogNoticias'}\n`);
    } catch (error) {
        console.error('❌ FALHA CRÍTICA:', error.message);
        process.exit(1);
    }
});

// === GRACEFUL SHUTDOWN ===
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} recebido. Encerrando...`);
    server.close(async (err) => {
        if (err) {
            console.error('Erro no shutdown:', err);
            process.exit(1);
        }
        await db.end();
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
    });
    
    // Força encerramento após 10s
    setTimeout(() => {
        console.error('Forçando encerramento...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;