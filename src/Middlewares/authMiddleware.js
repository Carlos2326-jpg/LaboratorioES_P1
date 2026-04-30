const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token de autenticação não fornecido' 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token inválido' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.usuario = decoded;
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error.message);
        res.status(401).json({ 
            success: false, 
            error: 'Token inválido ou expirado' 
        });
    }
};

const adminOnly = (req, res, next) => {
    if (req.usuario.nivelAcesso !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            error: 'Acesso exclusivo de administrador' 
        });
    }
    next();
};

const editorOrAdmin = (req, res, next) => {
    if (!['admin', 'editor'].includes(req.usuario.nivelAcesso)) {
        return res.status(403).json({ 
            success: false, 
            error: 'Acesso exclusivo de editor ou administrador' 
        });
    }
    next();
};

const autorOrHigher = (req, res, next) => {
    if (!['admin', 'editor', 'autor'].includes(req.usuario.nivelAcesso)) {
        return res.status(403).json({ 
            success: false, 
            error: 'Acesso exclusivo de autor ou superior' 
        });
    }
    next();
};

module.exports = { 
    authMiddleware, 
    adminOnly, 
    editorOrAdmin, 
    autorOrHigher 
};