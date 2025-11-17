import axios from 'axios';

const SUNAT_API_URL = 'https://api.perudevs.com';
const SUNAT_TOKEN = process.env.EXPO_PUBLIC_SUNAT_TOKEN;

export interface SUNATEmpresa {
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  estado: string;
  condicion: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  actividad_principal: string;
}

export interface SUNATPersona {
  dni: string;
  nombres: string;
  apellidos: string;
  estado: string;
}

export const sunatService = {
  // Buscar empresa por RUC
  async searchEmpresaByRUC(ruc: string): Promise<SUNATEmpresa | null> {
    try {
      const response = await axios.get(
        `${SUNAT_API_URL}/v2/ruc`,
        {
          params: { numero: ruc },
          headers: {
            Authorization: `Bearer ${SUNAT_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error searching SUNAT empresa:', error);
      throw error;
    }
  },

  // Buscar persona por DNI
  async searchPersonaByDNI(dni: string): Promise<SUNATPersona | null> {
    try {
      const response = await axios.get(
        `${SUNAT_API_URL}/v2/dni`,
        {
          params: { numero: dni },
          headers: {
            Authorization: `Bearer ${SUNAT_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error searching SUNAT persona:', error);
      throw error;
    }
  },

  // Validar RUC formato
  validateRUCFormat(ruc: string): boolean {
    return /^\d{11}$/.test(ruc);
  },

  // Validar DNI formato
  validateDNIFormat(dni: string): boolean {
    return /^\d{8}$/.test(dni);
  },
};
