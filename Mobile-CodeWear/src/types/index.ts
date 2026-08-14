export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  tipo: 'CLIENTE' | 'ADMIN';
  criadoEm?: string;
}

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl?: string;
}

export interface CartItem {
  id: number;
  produtoId: number;
  quantidade: number;
  produto: Product;
}

export interface Order {
  id: number;
  usuarioId: number;
  total: number;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  itens: CartItem[];
  criadoEm: string;
}