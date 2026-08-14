import axios from 'axios';

// Lembre-se de substituir o IP pelo IPv4 da sua máquina (descubra rodando 'ipconfig' no terminal)
export const api = axios.create({
  baseURL: 'http://192.168.1.100:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});