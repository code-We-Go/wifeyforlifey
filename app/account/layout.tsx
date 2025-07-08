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
    <div className="min-h-screen bg-gray-50 bg-pattern1">
      <div className='w-full min-h-screen h-full backdrop-blur-[4px] bg-black/25'>
        <div className="mx-auto h-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="flex gap-8 min-w-0">
            {/* Sidebar */}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-creamey border-lovely border-4 text-lovely rounded-2xl shadow-sm p-6 overflow-hidden">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 