require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'tu_secreto_super_seguro',
  expiresIn: '24h', // Tiempo de expiración del token
  rounds: 10 // Costo del hashing para bcrypt
};