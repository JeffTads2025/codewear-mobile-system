import axios from 'axios';

// IP fixado com base no seu adaptador Wi-Fi (192.168.1.16)
export const api = axios.create({
  baseURL: 'http://192.168.1.16:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});