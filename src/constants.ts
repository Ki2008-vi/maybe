import { Product, LookbookItem } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'NINEFIVE BLACK',
    category: 'T-Shirt',
    price: 248000,
    status: 'Sold Out',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594932224828-b4b059b6fe1c?q=80&w=1000&auto=format&fit=crop'
    ]
  },
  {
    id: '2',
    name: 'PIPPERS BLACK',
    category: 'Pants',
    price: 550000,
    status: 'Sold Out',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop'
    ]
  },
  {
    id: '3',
    name: 'LS - MAXED BLACK',
    category: 'Long Sleeve',
    price: 308000,
    status: 'Sold Out',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop'
    ]
  },
  {
    id: '4',
    name: 'COMMUNITY T-SHIRT',
    category: 'T-Shirt',
    price: 400000,
    status: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000&auto=format&fit=crop'
    ]
  },
  {
    id: '5',
    name: 'THE DREAM ZIPPER',
    category: 'Outwear',
    price: 875000,
    status: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop'
    ]
  },
  {
    id: '6',
    name: 'LAUNDRY BAG BLACK',
    category: 'Accessories',
    price: 300000,
    status: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1000&auto=format&fit=crop'
    ]
  }
];

export const LOOKBOOKS: LookbookItem[] = [
  {
    id: 'lb1',
    title: 'SNSB X BLEACH',
    year: '2026',
    description: 'Anime-inspired editorial collaboration.',
    images: [
      'https://images.unsplash.com/photo-1529139572765-397437ef19b2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109132314-34a9d6332956?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop'
    ]
  },
  {
    id: 'lb2',
    title: 'RAYA COLLECTION 26',
    year: '2026',
    description: 'Seasonal festive collection for Eid 2026.',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1200&auto=format&fit=crop'
    ]
  }
];
