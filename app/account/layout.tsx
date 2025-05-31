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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md group"
                  >
                    <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    {item.label}
                  </Link>
                ))}
                <button
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md group"
                >
                  <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 