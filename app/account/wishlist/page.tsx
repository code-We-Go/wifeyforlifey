import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  // This would typically come from your database
  const wishlistItems = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      image: '/images/headphones.jpg',
      inStock: true,
    },
    {
      id: 2,
      name: 'Smart Watch Series 5',
      price: 399.99,
      image: '/images/smartwatch.jpg',
      inStock: false,
    },
    {
      id: 3,
      name: 'Bluetooth Speaker',
      price: 129.99,
      image: '/images/speaker.jpg',
      inStock: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <span className="text-sm text-gray-500">{wishlistItems.length} items</span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none sm:h-48">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover object-center sm:h-full sm:w-full"
              />
            </div>
            <div className="flex flex-1 flex-col space-y-2 p-4">
              <h3 className="text-sm font-medium text-gray-900">
                <a href="#">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {item.name}
                </a>
              </h3>
              <p className="text-sm text-gray-500">${item.price}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-400 hover:text-gray-500"
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 