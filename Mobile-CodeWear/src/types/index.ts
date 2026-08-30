export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  tipo: 'CLIENTE' | 'ADMIN';
  criadoEm?: string;
}

export interface ProductSize {
  id: number;
  productId: number;
  size: string;
  stock: number;
}

export interface Promotion {
  id: number;
  code: string;
  discountPercentage: number;
  validUntil?: string;
  isActive: boolean;
  productId?: number | null;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  sizes?: ProductSize[];
  promotions?: Promotion[];
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  size?: string; // 👈 Tamanho escolhido pelo cliente (P, M, G, GG)
  product: Product;
}

export interface CouponValidationResponse {
  message: string;
  coupon: {
    id: number;
    code: string;
    discountPercentage: number;
    productId: number | null;
  };
}

export interface Order {
  id: number;
  usuarioId: number;
  total: number;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  itens: CartItem[];
  criadoEm: string;
}