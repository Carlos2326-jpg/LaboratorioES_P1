const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const postagemValidation = [
  body('titulo').notEmpty().withMessage('Título é obrigatório').trim().isLength({ min: 3 }),
  body('conteudo').notEmpty().withMessage('Conteúdo é obrigatório'),
  body('categorias').isArray().withMessage('Categorias deve ser um array'),
  body('categorias.*').isInt().withMessage('ID de categoria inválido'),
  validate
];

const usuarioValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres'),
  validate
];

module.exports = { postagemValidation, usuarioValidation };