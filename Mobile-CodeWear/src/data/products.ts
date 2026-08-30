export interface Product {
  id: string | number;
  name?: string;
  nome?: string;
  price?: number;
  preco?: number;
  stock?: number;
  estoque?: number;
  description?: string;
  descricao?: string;
  image?: string;
  image_url?: string;
  imagemUrl?: string;
  sizes?: string[] | { id: number; size: string; stock: number }[];
  promotions?: {
    id: number;
    code: string;
    discountPercentage: number;
    validUntil?: string;
    isActive: boolean;
    productId?: number | null;
  }[];
  colors?: { id: number; productId: number; name: string }[];
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: "CAMISETA I'm not a Hacker",
    price: 10.00,
    stock: 1,
    description: 'Tamanho único - Unissex. Algodão 100% penteado super macio.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '2',
    name: 'Camiseta SQL Select People',
    price: 78.90,
    stock: 0,
    description: 'Tamanho único - Unissex. Modelagem street para devs exigentes.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '3',
    name: 'Camiseta - Dia De Update Sem Where',
    price: 98.60,
    stock: 2,
    description: 'Tamanho único - Unissex. Estampa com silk-screen de alta durabilidade.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '4',
    name: 'Camiseta Python Code',
    price: 89.50,
    stock: 3,
    description: 'Tamanho único - Unissex. Para quem curte código limpo e moderno.',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '5',
    name: 'Camiseta - JavaScript Developer',
    price: 78.98,
    stock: 3,
    description: 'Tamanho único - Unissex. Ideal para o dia a dia e eventos de tecnologia.',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '6',
    name: 'Camiseta PROGRAMADOR C++',
    price: 84.90,
    stock: 5,
    description: 'Tamanho único - Unissex. Escolha sua arma de desenvolvimento.',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
    sizes: ['P', 'M', 'G', 'GG'],
  },
];