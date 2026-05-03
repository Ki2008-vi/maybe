export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'In Stock' | 'Sold Out';
  images: string[];
  description?: string;
}

export interface LookbookItem {
  id: string;
  title: string;
  year: string;
  description: string;
  images: string[];
}
