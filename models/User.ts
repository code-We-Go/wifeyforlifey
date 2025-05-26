export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string; // Not returned in API responses
  isAdmin?: boolean;
  isSubscribed?: boolean;
  subscriptionEndDate?: Date;
  cart?: CartItem[];
  wishlist?: string[]; // Product IDs
  orders?: Order[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export interface Order {
  _id?: string;
  products: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  isPaid?: boolean;
  paidAt?: Date;
  isDelivered?: boolean;
  deliveredAt?: Date;
  createdAt?: Date;
}

export interface Address {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Mock user for development
export const mockUser: User = {
  _id: 'user1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  isAdmin: false,
  isSubscribed: false,
  cart: [
    {
      productId: '1',
      quantity: 1,
      name: 'Pastel Pink Cardigan',
      price: 39.99,
      image: 'https://images.pexels.com/photos/7691096/pexels-photo-7691096.jpeg'
    },
  ],
  wishlist: ['3', '5'],
  orders: [],
};

export const mockAdmin: User = {
  _id: 'admin1',
  name: 'Admin User',
  email: 'admin@example.com',
  isAdmin: true,
  isSubscribed: true,
  subscriptionEndDate: new Date('2025-12-31'),
};