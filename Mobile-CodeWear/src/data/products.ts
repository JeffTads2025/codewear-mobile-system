export interface Product {
  id: string | number;
  name?: string;
  nome?: string;
  price?: number;
  preco?: number;
  stock?: number;
  estoque?: number;
  isVisible?: boolean;
  description?: string;
  descricao?: string;
  image?: string;
  image_url?: string;
  imagemUrl?: string;
  sizes?: string[] | { id: number; size: string; stock: number }[];
  promotions?: {
    id: number;
    code?: string | null;
    discountPercentage: number;
    validFrom?: string;
    validUntil?: string;
    isActive: boolean;
    productId?: number | null;
  }[];
}

