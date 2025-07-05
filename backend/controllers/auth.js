const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validar entrada
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      // Buscar usuario y verificar credenciales
      const user = await User.findByCredentials(email, password);
      
      // Crear token JWT
      const token = jwt.sign(
        { userId: user.CONSECUSER },
        authConfig.secret,
        { expiresIn: authConfig.expiresIn }
      );
      
      // Omitir datos sensibles en la respuesta
      const userData = {
        id: user.CONSECUSER,
        username: user.USUARIO,
        email: user.EMAIL,
        theme: user.TEMAUSER,
        avatar: user.IMAGEUSER
      };

      res.json({ user: userData, token });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({ error: error.message || 'Error en la autenticación' });
    }
  }

  async register(req, res) {
    try {
      const { nombre, apellido, email, password, usuario } = req.body;
      
      // Validar entrada
      if (!nombre || !apellido || !email || !password || !usuario) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Verificar si el email ya existe
      const emailExists = await User.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Crear nuevo usuario
      const userId = await User.create({
        nombre,
        apellido,
        email,
        password,
        usuario
      });

      // Obtener datos del usuario recién creado
      const user = await User.findById(userId);

      // Crear token JWT
      const token = jwt.sign(
        { userId: user.CONSECUSER },
        authConfig.secret,
        { expiresIn: authConfig.expiresIn }
      );
      
      // Omitir datos sensibles en la respuesta
      const userData = {
        id: user.CONSECUSER,
        username: user.USUARIO,
        email: user.EMAIL,
        theme: user.TEMAUSER,
        avatar: user.IMAGEUSER
      };

      res.status(201).json({ user: userData, token });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar el usuario' });
    }
  }

  async getUserData(req, res) {
    try {
      // El middleware de autenticación ya verificó el token y añadió userId a req
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Omitir datos sensibles en la respuesta
      const userData = {
        id: user.CONSECUSER,
        username: user.USUARIO,
        email: user.EMAIL,
        theme: user.TEMAUSER,
        avatar: user.IMAGEUSER
      };

      res.json(userData);
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      res.status(500).json({ error: 'Error al obtener datos de usuario' });
    }
  }
}

module.exports = new AuthController();