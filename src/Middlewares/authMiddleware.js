const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
}

function adminOnly(req, res, next) {
  if (req.usuario.nivelAcesso !== 'admin') {
    return res.status(403).json({ success: false, error: 'Acesso negado. Requer nível de administrador.' });
  }
  next();
}

function editorOrAdmin(req, res, next) {
  if (!['admin', 'editor'].includes(req.usuario.nivelAcesso)) {
    return res.status(403).json({ success: false, error: 'Acesso negado. Requer nível de editor ou administrador.' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly, editorOrAdmin };