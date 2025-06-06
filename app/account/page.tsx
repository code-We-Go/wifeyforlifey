'use client'

import { UserCircle, Heart, ShoppingBag, Gift } from 'lucide-react';
import { useEffect } from 'react';
import { ConnectDB } from '../config/db';
import axios from 'axios'

export default function AccountPage() {
  useEffect(() => {
    

    const testDB = async () => {
      try {
        const res = await axios(`/api/db`);
     
      } catch (error) {
        console.error( error);
      }
      // try {
      //   const res = await axios(`/api/categoryProducts?categoryID=${categoryID}`);
      //   const data = res.data.data;
      //   console.log('categoryProducts'+data.length)
      //   setProductList(data);
      // } catch (error) {
      //   console.error("Error fetching category data:", error);
      // }
    };
    testDB()
  }, [])
  
  // This would typically come from your authentication system
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    loyaltyPoints: 1250,
    wishlistItems: 8,
    orders: 12,
  };

  const stats = [
    {
      name: 'Loyalty Points',
      value: user.loyaltyPoints,
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Wishlist Items',
      value: user.wishlistItems,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Total Orders',
      value: user.orders,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
          <UserCircle className="h-16 w-16 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className={`absolute rounded-md ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Order #12345</p>
              <p className="text-sm text-gray-500">Delivered on March 15, 2024</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Delivered
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Added to Wishlist</p>
              <p className="text-sm text-gray-500">Premium Headphones - March 14, 2024</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Earned Loyalty Points</p>
              <p className="text-sm text-gray-500">+250 points - March 13, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 