const API_URL = 'http://localhost:3000/api';

export const ubicacionService = {
  getUbicaciones: async () => {
    try {
      const response = await fetch(`${API_URL}/ubicaciones`);
      if (!response.ok) {
        throw new Error('Error al obtener ubicaciones');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido');
      }
      
      // Filtrar y transformar datos
      return data
        .map((ubic: any) => ({
          CODUBICA: (ubic.CODUBICA || ubic.codubica || '').toString(),
          NOMUBICA: (ubic.NOMUBICA || ubic.nomubica || '').toString()
        }))
        .filter(ubic => ubic.CODUBICA.trim() !== '');
    } catch (error) {
      console.error("Error en ubicacionService:", error);
      throw new Error('Error al obtener ubicaciones');
    }
  }
};