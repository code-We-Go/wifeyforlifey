export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  featured?: boolean;
  ratings?: number;
  reviews?: Review[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Review {
  userId: string;
  username: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  search?: string;
}

// Mock data
export const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Pastel Pink Cardigan',
    description: 'Soft and cozy pastel pink cardigan, perfect for layering. Made with premium cotton blend for ultimate comfort.',
    price: 39.99,
    images: ['https://images.pexels.com/photos/7691096/pexels-photo-7691096.jpeg'],
    category: 'clothing',
    stock: 25,
    featured: true,
    ratings: 4.8,
  },
  {
    _id: '2',
    name: 'Lavender Scented Candle',
    description: 'Relaxing lavender scented candle in a beautiful glass jar. Burns for up to 50 hours.',
    price: 24.99,
    images: ['https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg'],
    category: 'home',
    stock: 50,
    ratings: 4.7,
  },
  {
    _id: '3',
    name: 'Rose Gold Earrings',
    description: 'Elegant rose gold earrings with small diamond accents. Perfect for everyday wear or special occasions.',
    price: 79.99,
    images: ['https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg'],
    category: 'accessories',
    stock: 15,
    featured: true,
    ratings: 4.9,
  },
  {
    _id: '4',
    name: 'Mint Green Throw Pillow',
    description: 'Soft mint green throw pillow with delicate embroidery. Adds a touch of color to any room.',
    price: 29.99,
    images: ['https://images.pexels.com/photos/4352247/pexels-photo-4352247.jpeg'],
    category: 'home',
    stock: 30,
    ratings: 4.5,
  },
  {
    _id: '5',
    name: 'Cherry Blossom Bath Bombs',
    description: 'Set of 6 cherry blossom scented bath bombs. Creates a luxurious bathing experience with natural ingredients.',
    price: 18.99,
    images: ['https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg'],
    category: 'bath',
    stock: 40,
    featured: true,
    ratings: 4.6,
  },
  {
    _id: '6',
    name: 'Pastel Planner Set',
    description: 'Beautiful pastel planner set with stickers, pens, and bookmarks. Perfect for organizing your life in style.',
    price: 34.99,
    images: ['https://images.pexels.com/photos/6157228/pexels-photo-6157228.jpeg'],
    category: 'stationery',
    stock: 20,
    ratings: 4.8,
  },
];

export const productCategories = [
  { id: 'clothing', name: 'Clothing' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'home', name: 'Home Decor' },
  { id: 'bath', name: 'Bath & Body' },
  { id: 'stationery', name: 'Stationery' },
];