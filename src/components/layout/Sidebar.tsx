import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Wrench,
  Calendar,
  DollarSign,
  Wallet,
  FileText,
  Settings,
  Gift,
  Percent,
  Receipt,
  Tag,
  Image,
  Monitor,
  FileCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Providers', href: '/providers', icon: Building2 },
  { name: 'Services', href: '/services', icon: Wrench },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Commissions', href: '/commissions', icon: DollarSign },
  { name: 'Wallets', href: '/wallets', icon: Wallet },
  { name: 'Loyalty & Cashback', href: '/loyalty', icon: Gift },
  { name: 'Commission Rules', href: '/commission-rules', icon: Percent },
  { name: 'Tax Settings', href: '/tax', icon: Receipt },
  { name: 'Promo Offers', href: '/promo', icon: Tag },
  { name: 'Sliders', href: '/sliders', icon: Image },
  { name: 'Splash Screens', href: '/splash', icon: Monitor },
  { name: 'Invoices', href: '/invoices', icon: FileCheck },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
      {/* Logo — Design System: gradient orange */}
      <div className="flex h-14 sm:h-16 items-center px-6 bg-gradient-to-r from-orange-500 to-orange-600">
        <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
          Bayt Car Admin
        </h1>
      </div>

      {/* Navigation — Design System: active = orange gradient, inactive = gray hover, rounded-xl */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          © 2026 Qeematech
        </p>
      </div>
    </aside>
  );
};
