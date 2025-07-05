const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { abrirConexion } = require('../config/database.connect');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const connection = await abrirConexion();
      
      const result = await connection.execute(
        `SELECT * FROM USUARIO WHERE EMAIL = :email`,
        [email],
        { outFormat: require('oracledb').OBJECT }
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      const user = result.rows[0];
    

      if (!user.PASSWORD) {
        console.error('Contraseña no encontrada en:', user);
        return res.status(500).json({ message: 'Error en la base de datos: contraseña no encontrada' });
      }
      
      const isValid = await bcrypt.compare(password, user.PASSWORD);
      
      if (!isValid) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // Generar token
      const token = jwt.sign(
        { 
          consecuser: user.CONSECUSER,
          nombre: user.NOMBRE,
          apellido: user.APELLIDO,
          email: user.EMAIL,
          ubicacion: user.CODUBICA
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      res.json({ token });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  },

  signup: async (req, res) => {
    try {
      const { firstName, lastName, username, email, phone, password, ubicacion } = req.body;
      const connection = await abrirConexion();
      
      // Usar formato de objeto para todas las consultas
      const options = { outFormat: require('oracledb').OBJECT };
      
      const emailCheck = await connection.execute(
        `SELECT * FROM USUARIO WHERE EMAIL = :email`,
        [email],
        options
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      const usernameCheck = await connection.execute(
        `SELECT * FROM USUARIO WHERE NOMBRE_USUARIO = :username`,
        [username],
        options
      );
      
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
      }
      
      const ubicacionCheck = await connection.execute(
        `SELECT * FROM UBICACION WHERE CODUBICA = :ubicacion`,
        [ubicacion],
        options
      );
      
      if (ubicacionCheck.rows.length === 0) {
        return res.status(400).json({ message: 'La ubicación seleccionada no es válida' });
      }

      const consecuser = uuidv4().substring(0, 5).toUpperCase();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await connection.execute(
        `INSERT INTO USUARIO (
          CONSECUSER, CODUBICA, NOMBRE, APELLIDO, NOMBRE_USUARIO, 
          FECHAREGISTRO, EMAIL, CELULAR, PASSWORD
        ) VALUES (
          :consecuser, :ubicacion, :firstName, :lastName, :username,
          SYSDATE, :email, :phone, :password
        )`,
        {
          consecuser,
          ubicacion,
          firstName,
          lastName,
          username,
          email,
          phone,
          password: hashedPassword
        },
        { autoCommit: true }
      );
      
      const token = jwt.sign(
        { 
          consecuser,
          nombre: firstName,
          apellido: lastName,
          email,
          ubicacion
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      res.status(201).json({ token });
    } catch (error) {
      console.error('Error en signup:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};