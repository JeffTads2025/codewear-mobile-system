export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  sizes: string[];
}

const createSvg = (title1: string, title2: string = '', titleColor: string = '#FFFFFF') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="#1E1E1E"/>
    <text x="50%" y="${title2 ? '42%' : '52%'}" fill="${titleColor}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${title1}</text>
    ${title2 ? `<text x="50%" y="58%" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">${title2}</text>` : ''}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: "CAMISETA I'm not a Hacker",
    price: 10.00,
    stock: 1,
    description: 'Tamanho único - Unissex. Algodão 100% penteado super macio.',
    image: createSvg("I'M NOT A", 'HACKER.', '#FFCC00'),
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '2',
    name: 'Camiseta SQL Select People',
    price: 78.90,
    stock: 0,
    description: 'Tamanho único - Unissex. Modelagem street para devs exigentes.',
    image: createSvg('SELECT * FROM', 'other_people', '#FFCC00'),
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '3',
    name: 'Camiseta - Dia De Update Sem Where',
    price: 98.60,
    stock: 2,
    description: 'Tamanho único - Unissex. Estampa com silk-screen de alta durabilidade.',
    image: createSvg('dia de UPDATE', 'sem WHERE', '#00E676'),
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '4',
    name: 'Camiseta Python Code',
    price: 89.50,
    stock: 3,
    description: 'Tamanho único - Unissex. Para quem curte código limpo e moderno.',
    image: createSvg('🐍 PYTHON', 'CODE', '#3776AB'),
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '5',
    name: 'Camiseta - JavaScript Developer',
    price: 78.98,
    stock: 3,
    description: 'Tamanho único - Unissex. Ideal para o dia a dia e eventos de tecnologia.',
    image: createSvg('JS', 'Developer', '#F7DF1E'),
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: '6',
    name: 'Camiseta PROGRAMADOR C++',
    price: 84.90,
    stock: 5,
    description: 'Tamanho único - Unissex. Escolha sua arma de desenvolvimento.',
    image: createSvg('C++', 'WEAPON', '#00599C'),
    sizes: ['P', 'M', 'G', 'GG'],
  },
];