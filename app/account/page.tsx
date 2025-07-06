'use client'

import { UserCircle, Heart, ShoppingBag, Gift, BadgeCheck, BadgeAlert, Package, Truck, CheckCircle, Edit, Camera } from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios'
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { thirdFont } from '@/fonts';
import { wishListContext } from '../context/wishListContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  orderID?: string;
  total?: number;
  status?: string;
  payment?: string;
  createdAt?: string;
  cart?: any[];
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { wishList } = useContext(wishListContext);
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setUserInfo({
        name: session.user.name || 'User',
        email: session.user.email || 'user@example.com',
        imageUrl: session.user.image || ''
      });
      fetchUserOrders();
    }
  }, [session]);

  const fetchUserOrders = async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/orders?email=${session.user.email}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'confirmed':
        return <Package className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would typically upload to your server/cloud storage
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      setUserInfo(prev => ({ ...prev, imageUrl }));
    }
  };

  const handleSaveInfo = async () => {
    try {
      // Here you would typically save to your backend
      toast({
        title: "Success",
        description: "Profile information updated successfully",
      });
      setEditingInfo(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive"
      });
    }
  };

  // Show loading state while session is loading
  if (status === 'loading') {
    return <ProfileSkeleton />;
  }

  // Show loading state while session is loading
  if (!session?.user) {
    return <div>Not authenticated</div>;
  }

  const user = {
    name: session.user.name || 'User',
    email: session.user.email || 'user@example.com',
    isSubscribed: session.user.isSubscribed || false,
    imgUrl: session.user.image,
    loyaltyPoints: 1250,
    wishlistItems: wishList.length,
    orders: orders.length,
  };

  const stats = [
    {
      name: 'Loyalty Points',
      value: user.loyaltyPoints,
      icon: Gift,
      color: 'text-lovely',
      bgColor: 'bg-creamey',
    },
    {
      name: 'Wishlist Items',
      value: user.wishlistItems,
      icon: Heart,
      color: 'text-lovely',
      bgColor: 'bg-creamey',
    },
    {
      name: 'Total Orders',
      value: user.orders,
      icon: ShoppingBag,
      color: 'text-lovely',
      bgColor: 'bg-creamey',
    },
  ];

  const tabs = [
    { id: 'orders', label: 'Recent Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'royalty', label: 'Royalty', icon: Gift },
    { id: 'info', label: 'Info', icon: UserCircle },
  ];

  return (
    <div className="space-y-6 text-creamey">
      {/* Profile Header */}
      <div className='w-full flex flex-col sm:flex-row sm:justify-between gap-4'>
        <div className="flex items-center space-x-4 min-w-0">
          {user.imgUrl ? 
            <div className='rounded-full h-24 w-24 border-2 border-lovely relative flex-shrink-0'> 
              <Image
                className='rounded-full'
                alt={user.name} 
                src={user.imgUrl}  
                fill
              /> 
            </div> :
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <UserCircle className="h-16 w-16 text-gray-400" />
            </div>
          }
          <div className='min-w-0 flex-1'>
            <h1 className={`text-2xl sm:text-4xl font-bold text-lovely tracking-normal break-words ${thirdFont.className}`}>{user.name}</h1>
            <p className="text-sm font-semibold text-lovely/80 break-all">{user.email}</p>
            <p className="text-sm font-semibold flex items-center gap-2 text-lovely/80">
              Subscription : <span>{user.isSubscribed ? <BadgeCheck className='text-everGreen' /> : <BadgeAlert />}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-pinkey px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className={`absolute rounded-md ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm text-lovely font-semibold">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-lovely">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-lovely text-lovely'
                  : 'border-transparent text-gray-500 hover:text-lovely duration-300 hover:border-lovely'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-lovely">Recent Orders</h2>

            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
                
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order._id} className="flex items-center justify-between border-b pb-4 gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-lovely truncate">
                        Order #{order.orderID || order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusIcon(order.status || 'pending')}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                        {(order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending')}
                      </span>
                    </div>
                  </div>
                ))}
                              <Button 
              className='bg-lovely text-creamey rounded-2xl hover:border hover:border-lovely hover:bg-creamey hover:text-lovely'
                variant="outline" 
                size="sm"
                onClick={() => setShowAllOrders(!showAllOrders)}
              >
                {showAllOrders ? 'Hide All' : 'See All'}
              </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-lg font-medium text-lovely mb-4">Wishlist Items</h2>
            {wishList.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishList.slice(0, 6).map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <div className="relative h-32 mb-3">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <h3 className="font-medium text-lovely text-sm mb-1 truncate">{item.productName}</h3>
                    <p className="text-gray-500 text-sm">{item.price} LE</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'royalty' && (
          <div className=''>
            <h2 className="text-lg font-medium text-lovely mb-4">Loyalty Program</h2>
            <div className="bg-lovely rounded-lg shadow p-6">
              <div className="text-center">
                <Gift className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-creamey mb-2">Loyalty Points</h3>
                <p className="text-3xl font-bold text-purple-600 mb-4">{user.loyaltyPoints}</p>
                <p className="text-gray-500 mb-4">Earn points with every purchase and unlock exclusive rewards!</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="font-medium text-purple-800">Next Reward</p>
                    <p className="text-purple-600">1500 points</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="font-medium text-purple-800">Points to Go</p>
                    <p className="text-purple-600">{1500 - user.loyaltyPoints}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-lovely">Profile Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingInfo(!editingInfo)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editingInfo ? 'Cancel' : 'Edit'}
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {userInfo.imageUrl ? (
                      <div className="relative h-20 w-20 rounded-full overflow-hidden">
                        <Image
                          src={userInfo.imageUrl}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCircle className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {editingInfo && (
                      <label className="absolute bottom-0 right-0 bg-lovely text-white p-1 rounded-full cursor-pointer">
                        <Camera className="h-3 w-3" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Profile Picture</p>
                    {editingInfo && (
                      <p className="text-xs text-gray-400">Click the camera icon to change</p>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  {editingInfo ? (
                    <Input
                      id="name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{userInfo.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  {editingInfo ? (
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{userInfo.email}</p>
                  )}
                </div>

                {/* Subscription Status */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Subscription Status
                  </Label>
                  <div className="mt-1 flex items-center space-x-2">
                    {user.isSubscribed ? (
                      <>
                        <BadgeCheck className="h-4 w-4 text-everGreen" />
                        <span className="text-sm text-everGreen">Active Subscription</span>
                      </>
                    ) : (
                      <>
                        <BadgeAlert className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">No Active Subscription</span>
                      </>
                    )}
                  </div>
                </div>

                {editingInfo && (
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleSaveInfo} className="bg-lovely text-creamey hover:bg-lovely/90">
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingInfo(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Section for "See All" button */}
      {showAllOrders && (
        <div id="orders-section" className="mt-12">
          <h2 className="text-2xl font-bold text-lovely mb-6">All Orders</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500">Start shopping to see your order history here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-3 min-w-0">
                        {getStatusIcon(order.status || 'pending')}
                        <h3 className="text-lg font-medium leading-6 text-gray-900 truncate">
                          Order : {order._id}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                          {(order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">Total:</span>{' '}
                        {order.total} LE
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 