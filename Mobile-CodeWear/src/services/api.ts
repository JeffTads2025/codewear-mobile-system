import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CouponValidationResponse } from '../types';

// Endereço do IP local da sua máquina na rede Wi-Fi
export const apiBaseUrl = 'http://192.168.1.19:3000';

export const getApiAssetUrl = (assetPath?: string | null): string | undefined => {
  if (!assetPath) return undefined;
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, apiBaseUrl);
  }
  return `${apiBaseUrl.replace(/\/$/, '')}/${assetPath.replace(/^\//, '')}`;
};

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('codewear_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao carregar token do AsyncStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const saveAuthToken = (token: string) => AsyncStorage.setItem('codewear_token', token);
export const clearAuthToken = () => AsyncStorage.removeItem('codewear_token');

export const validateCoupon = async (code: string): Promise<CouponValidationResponse> => {
  const response = await api.post<CouponValidationResponse>('promotions/validate', { code });
  return response.data;
};