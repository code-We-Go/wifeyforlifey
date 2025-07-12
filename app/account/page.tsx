'use client'

import { UserCircle, Heart, ShoppingBag, Gift, BadgeCheck, BadgeAlert, Package, Truck, CheckCircle, Edit, Camera, ShoppingCart, Trash2, Crown } from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios'
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { lifeyFont, thirdFont } from '@/fonts';
import { wishListContext } from '../context/wishListContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import CartItemSmall from '../cart/CartItemSmall';
import { IOrder } from '../interfaces/interfaces';
import { useCart } from '@/providers/CartProvider';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { wishList, setWishList } = useContext(wishListContext);
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    imageUrl: ''
  });
  const [isDetailsModalOpen, setDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [modalStatus, setModalStatus] = useState<string>('pending');
  const [modalPayment, setModalPayment] = useState<string>('pending');
  const handleRemoveFromWishlist = (productId: string, variant: any, attributes: any) => {
    setWishList((prevList) => 
      prevList.filter(
        (item) => 
          item.productId !== productId || 
          item.variant !== variant || 
          item.attributes !== attributes
      )
    );
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleMoveToCart = (item: any) => {
    addItem(item);
    handleRemoveFromWishlist(item.productId, item.variant, item.attributes);
    toast({
      title: "Added to cart",
      description: `${item.productName} has been moved to your cart.`,
    });
  };

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
        return <CheckCircle className="h-4 w-4 text-creamey" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-creamey" />;
      case 'confirmed':
        return <Package className="h-4 w-4 text-creamey" />;
      default:
        return <Package className="h-4 w-4 text-creamey" />;
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
    subscriptionExpiryDate:session.user.subscriptionExpiryDate,
    imgUrl: session.user.image,
    loyaltyPoints: 0,
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
    { id: 'Loyality', label: 'Loyality', icon: Gift },
    // { id: 'info', label: 'Info', icon: UserCircle },
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
              Subscription : <span>{user.isSubscribed ? <BadgeCheck className='text-lovely/80' /> : <BadgeAlert />}</span>
            </p>
          {user.isSubscribed && <p className='text-lovely/80 text-sm font-semibold'>Expires at : {user.subscriptionExpiryDate ? (() => { const expiry = new Date(user.subscriptionExpiryDate); const now = new Date(); const tenYearsFromNow = new Date(now.setFullYear(now.getFullYear() + 10)); return expiry > tenYearsFromNow ? <span className='inline-flex gap-2 items-end'>Lifetime Wifey <Crown/></span> : expiry.toLocaleDateString(); })() : ''}</p>}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-lovely px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className={`absolute rounded-md ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm text-creamey font-semibold">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-creamey">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-pinkey overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-lovely text-lovely font-semibold'
                  : 'border-transparent text-lovely/90 hover:text-lovely duration-300 hover:border-lovely'
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
                <ShoppingBag className="h-12 w-12 text-lovely mx-auto mb-4" />
                <p className="text-lovely">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                <div key={order._id} className="bg-lovely text-creamey  rounded-lg shadow overflow-hidden">
                <div className="border-b  px-4 py-5 text-creamey sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center text-creamey space-x-3 min-w-0">
                      {getStatusIcon(order.status || 'pending')}
                      <h3 className="text-lg font-medium leading-6  truncate">
                        Order : {order._id}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 flex-shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                        {(order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending')}
                      </span>
                      <span className="text-sm text-creamey">
                        {new Date(order.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-creamey">
                      <span className="font-medium ">Total:</span>{' '}
                      {order.total} LE
                    </div>
                    <Button
                      className='bg-creamey text-lovely hover:bg-everGreen hover:text-creamey duration-300 transition'
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setModalStatus(order.status || 'pending');
                        setModalPayment(order.payment || 'pending');
                        setDetailsModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
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
            <h2 className="text-lg  text-lovely mb-4 font-semibold">Wishlist Items</h2>
            {wishList.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-lovely mx-auto mb-4" />
                <p className="text-lovely font-semibold">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="grid w-full gap-4">
                {wishList.slice(0, 6).map((item, index) => (
           <div key={index} className="bg-card bg-everGreen text-creamey rounded-lg p-4 md:p-6 shadow-sm">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
             {/* Product */}
             <div className="md:col-span-5 flex items-center space-x-4">
               <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                 <Image
                   src={item.imageUrl}
                   alt={item.productName}
                   fill
                   className="object-cover rounded-md"
                 />
               </div>
               <div>
                 <h5 className="font-medium line-clamp-1">{item.productName}</h5>
               </div>
             </div>

             <div className="md:col-span-1 hidden md:block text-center">
               {item.variant.name}
             </div>
             <div className="md:col-span-1 hidden md:block text-center">
               {item.attributes.name}
             </div>

             {/* Price */}
             <div className="md:col-span-1 hidden md:block text-center">
               LE{item.price.toFixed(2)}
             </div>

             {/* Actions */}
             <div className="md:col-span-4 flex items-center justify-end space-x-2">
               <Button
                 variant="outline"
                 size="sm"
                 className="text-creamey  hover:text-creamey hover:border hover:border-creamey bg-lovely hover:bg-saga"
                 onClick={() => handleMoveToCart(item)}
               >
                 <ShoppingCart className="h-4 w-4 mr-2" />
                 Move to Cart
               </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8 text-lovely/90 hover:font-semibold"
                 onClick={() => handleRemoveFromWishlist(item.productId, item.variant, item.attributes)}
               >
                 <Trash2 className="h-4 w-4" />
                 <span className="sr-only">Remove item</span>
               </Button>
             </div>
           </div>
         </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Loyality' && (
          <div className=''>
            <h2 className="text-lg font-semibold text-lovely mb-4">Loyality Points</h2>
            <div className='w-full justify-center items-center'>
            <h3 className={`${lifeyFont.className} text-lovely`}>coming soon</h3>
            </div>
            {/* <div className="bg-lovely rounded-lg shadow p-6">
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
            </div> */}
          </div>
        )}

        {activeTab === 'info' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-lovely">Profile Information</h2>
              <Button
              className='border border-lovely text-lovely bg-creamey hover:bg-creamey hover:text-lovely hover:cursor-pointer'
                variant="outline"
                size="sm"
                onClick={() => setEditingInfo(!editingInfo)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editingInfo ? 'Cancel' : 'Edit'}
              </Button>
            </div>
            
            <div className=" rounded-lg border-2  shadow-xl p-6">
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
              {orders.slice(3,orders.length).map((order) => (
                <div key={order._id} className="bg-lovely text-creamey  rounded-lg shadow overflow-hidden">
                  <div className="border-b  px-4 py-5 text-creamey sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center text-creamey space-x-3 min-w-0">
                        {getStatusIcon(order.status || 'pending')}
                        <h3 className="text-lg font-medium leading-6  truncate">
                          Order : {order._id}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                          {(order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending')}
                        </span>
                        <span className="text-sm text-creamey">
                          {new Date(order.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-creamey">
                        <span className="font-medium ">Total:</span>{' '}
                        {order.total} LE
                      </div>
                      <Button
                        className='bg-creamey text-lovely hover:bg-everGreen hover:text-creamey duration-300 transition'
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setModalStatus(order.status || 'pending');
                          setModalPayment(order.payment || 'pending');
                          setDetailsModal(true);
                        }}
                      >
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

      {isDetailsModalOpen && selectedOrder && (
        <div
          onClick={() => setDetailsModal(false)}
          className="fixed inset-0 bg-black  bg-opacity-50 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-creamey scrollbar-hide h-[90vh] overflow-y-scroll rounded-2xl p-6 shadow-lg w-[90%] max-w-3xl text-everGreen"
          >
            <div className="flex mb-2 w-full items-center justify-end">
              <span className="hover:cursor-pointer" onClick={() => setDetailsModal(false)}>x</span>
            </div>
            <h2 className="text-lg font-bold text-everGreen mb-4">ORDER DETAILS</h2>
            <div className="text-left space-y-2">
              <p><strong>Order ID:</strong> {selectedOrder.orderID || selectedOrder._id || "N/A"}</p>
              <p><strong>Email:</strong> {selectedOrder.email || "N/A"}</p>
              <p><strong>Customer:</strong> {selectedOrder.firstName || ''} {selectedOrder.lastName || ''}</p>
              <p><strong>Cart:</strong></p>
              <div className="flex flex-col gap-2">
                {selectedOrder.cart?.map((item, index) => (
                  <CartItemSmall key={index} item={item} wishListBool={false} />
                ))}
              </div>
              <p><strong>Phone:</strong> {selectedOrder.phone || "N/A"}</p>
              <p><strong>Address:</strong> {selectedOrder.address || ''}{selectedOrder.address ? ',' : ''} {selectedOrder.city || ''}{selectedOrder.city ? ',' : ''} {selectedOrder.state || ''}{selectedOrder.state ? ',' : ''} {selectedOrder.country || ''}</p>
              <p><strong>Postal Code:</strong> {selectedOrder.postalZip || "N/A"}</p>
              {/* Status Dropdown */}
              <label className="block font-semibold mt-4">Status:</label>
              <select
                className="border p-2 bg-creamey w-full"
                value={modalStatus}
                disabled
                onChange={() => {}}
              >
                {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {/* Payment Dropdown */}
              <label className="block font-semibold mt-4">Payment:</label>
              <select
                className="border bg-creamey p-2 w-full"
                value={modalPayment}
                disabled
                onChange={() => {}}
              >
                {["pending", "failed", "confirmed"].map((payment) => (
                  <option key={payment} value={payment}>{payment}</option>
                ))}
              </select>
              <p><strong>Sub-Total:</strong> {selectedOrder.subTotal !== undefined ? selectedOrder.subTotal.toFixed(2) : 'N/A'} LE</p>
              {/* <p><strong>Shipping:</strong> {selectedOrder.shipping !== undefined ? selectedOrder.shipping.toFixed(2) : 'N/A'} LE</p> */}
              <p><strong>Total:</strong> {selectedOrder.total !== undefined ? selectedOrder.total.toFixed(2) : 'N/A'} LE</p>
              <p><strong>Created At:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("en-EG", { timeZone: "Africa/Cairo" }) : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 