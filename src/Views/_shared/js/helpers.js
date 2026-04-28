const bcrypt = require('bcryptjs');
const slugify = require('slugify');

class Helpers {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static generateSlug(text) {
    return slugify(text, {
      lower: true,
      strict: true,
      locale: 'pt',
      remove: /[*+~.()'"!:@]/g
    });
  }

  static formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }

  static formatDateBR(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  static formatDateTimeBR(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
  }

  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static validatePassword(password) {
    return password && password.length >= 8;
  }

  static extractTextFromHTML(html, maxLength = 150) {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  static generateRandomToken(length = 32) {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }

  static paginate(items, page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = items.slice(start, end);

    return {
      data: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit)
    };
  }
}

module.exports = Helpers;