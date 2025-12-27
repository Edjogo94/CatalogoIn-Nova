
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number; 
  retailPrice: number;
  stock: number;
  image: string;
  features: string[];
  videoUrl?: string;
  originalIndex?: number;
  isNew?: boolean;
  isCombo?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum Category {
  HOME = 'Hogar',
  BEAUTY = 'Belleza y Cuidado',
  TECH = 'Tecnología',
  KITCHEN = 'Cocina',
  ORGANIZATION = 'Organización',
  TOOLS = 'Herramientas',
  COMBOS = 'Combos',
  ALL = 'Todos'
}

export interface EnrichmentResponse {
  products: {
    originalIndex: number;
    name: string;
    category: Category;
    description: string;
    price: number;
    features: string[];
  }[];
}