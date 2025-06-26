import { ReactNode } from 'react';
import Link from 'next/link';
import { 
  UserCircle, 
  Heart, 
  ShoppingBag, 
  Music, 
  Gift, 
  Settings,
  LogOut
} from 'lucide-react';

interface AccountLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: UserCircle, label: 'Profile', href: '/account' },
  { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
  { icon: ShoppingBag, label: 'Orders', href: '/account/orders' },
  { icon: Music, label: 'Playlists', href: '/account/playlists' },
  { icon: Gift, label: 'Loyalty Points', href: '/account/loyalty' },
  { icon: Settings, label: 'Settings', href: '/account/settings' },
];

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 bg-pattern1 ">
      <div className='w-full min-h-screen h-full backdrop-blur-[3px] bg-black/5'>
      <div className="max-w-7xl  mx-auto h-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}


          {/* Main Content */}
          <div className="flex-1 ">
            <div className="bg-white  rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
} 