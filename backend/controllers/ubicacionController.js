const { abrirConexion } = require('../config/database.connect');

module.exports = {
  getUbicaciones: async (req, res) => {
    try {
      const connection = await abrirConexion();
      const result = await connection.execute(
        `SELECT CODUBICA, NOMUBICA FROM UBICACION WHERE CODUBICA IS NOT NULL`
      );
      
      const ubicaciones = result.rows.map(row => {
        if (Array.isArray(row)) {
          return {
            CODUBICA: row[0],
            NOMUBICA: row[1]
          };
        } else {
          return {
            CODUBICA: row.CODUBICA,
            NOMUBICA: row.NOMUBICA
          };
        }
      });

      // Filtrar ubicaciones sin CODUBICA
      const filteredUbicaciones = ubicaciones.filter(ubic => 
        ubic.CODUBICA && ubic.CODUBICA.trim() !== ''
      );
      
      res.json(filteredUbicaciones);
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};