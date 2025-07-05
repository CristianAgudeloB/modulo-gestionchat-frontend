const API_URL = 'http://localhost:3000/api';

interface UbicacionRaw {
  CODUBICA?: string;
  codubica?: string;
  NOMUBICA?: string;
  nomubica?: string;
}

interface Ubicacion {
  CODUBICA: string;
  NOMUBICA: string;
}

export const ubicacionService = {
  getUbicaciones: async (): Promise<Ubicacion[]> => {
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
        .map((ubic: UbicacionRaw) => ({
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