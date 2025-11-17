import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@store/auth.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || 'v1';

class APIClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_URL}/api/${API_VERSION}`;

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const { session } = useAuthStore.getState();
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejo de errores
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().signOut();
        }
        return Promise.reject(error);
      }
    );
  }

  get(url: string, config?: any) {
    return this.axiosInstance.get(url, config);
  }

  post(url: string, data?: any, config?: any) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data?: any, config?: any) {
    return this.axiosInstance.put(url, data, config);
  }

  delete(url: string, config?: any) {
    return this.axiosInstance.delete(url, config);
  }

  patch(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch(url, data, config);
  }
}

export const apiClient = new APIClient();
