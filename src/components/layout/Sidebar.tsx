import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Monitor,
  FileCheck,
  Package,
  LogOut,
  Tag,
  Receipt,
  Image,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';



export const Sidebar = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const navigationGroups = [
    {
      title: t('common.overview'),
      items: [
        { name: t('common.dashboard'), href: '/', icon: LayoutDashboard },
      ]
    },
    {
      title: t('common.management'),
      items: [
        { name: t('common.users'), href: '/users', icon: Users },
        { name: t('common.providers'), href: '/providers', icon: Building2 },
        { name: t('common.services'), href: '/services', icon: Wrench },
        { name: t('common.deliveries'), href: '/delivery', icon: Package },
        { name: t('common.bookings'), href: '/bookings', icon: Calendar },
      ]
    },
    {
      title: t('common.finance'),
      items: [
        { name: t('common.commissions'), href: '/commissions', icon: DollarSign },
        { name: t('common.wallets'), href: '/wallets', icon: Wallet },
        { name: t('common.invoices'), href: '/invoices', icon: FileCheck },
        { name: t('common.reports'), href: '/reports', icon: FileText },
      ]
    },
    {
      title: t('common.marketingConfig'),
      items: [
        { name: t('common.loyalty'), href: '/loyalty', icon: Gift },
        { name: t('common.promo'), href: '/promo', icon: Tag },
        { name: t('common.commissionRules'), href: '/commission-rules', icon: Percent },
        { name: t('common.tax'), href: '/tax', icon: Receipt },
        { name: t('common.sliders'), href: '/sliders', icon: Image },
        { name: t('common.splash'), href: '/splash', icon: Monitor },
        { name: t('common.settings'), href: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/80 transition-all duration-300">
      {/* Logo Area */}
      <div className="flex h-20 items-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-violet-500/10 dark:from-orange-500/5 dark:to-violet-500/5" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
            <span className="text-xl font-bold">B</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Bayt Car
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        <div className="space-y-8">
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.title} className="animate-slide-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                        isActive
                          ? "bg-gradient-to-r from-orange-50 to-white text-orange-600 shadow-sm ring-1 ring-orange-100 dark:from-orange-900/20 dark:to-gray-900 dark:text-orange-400 dark:ring-orange-900/40 translate-x-1"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            "h-[18px] w-[18px] transition-colors duration-200",
                            isActive
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                          )}
                        />
                        <span>{item.name}</span>
                        {isActive && (
                          <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-orange-500 opacity-100 transition-opacity" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer / Settings */}
      <div className="border-t border-gray-100 bg-gray-50/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50 flex flex-col gap-2">
        <Button
          variant="ghost"
          onClick={toggleLanguage}
          className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-orange-400"
        >
          <Globe className="h-[18px] w-[18px]" />
          <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
        </Button>

        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 group">
          <LogOut className="h-[18px] w-[18px] transition-transform group-hover:-translate-x-0.5" />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
};
