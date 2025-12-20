
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number; 
  retailPrice: number;
  image: string;
  features: string[];
  videoUrl?: string;
  originalIndex?: number;
}

export enum Category {
  HOME = 'Hogar',
  BEAUTY = 'Belleza y Cuidado',
  TECH = 'Tecnología',
  KITCHEN = 'Cocina',
  ORGANIZATION = 'Organización',
  TOOLS = 'Herramientas',
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
