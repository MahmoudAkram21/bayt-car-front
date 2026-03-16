import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Shield,
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
  Globe,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useTheme } from '../theme-provider';
interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  const isRTL = i18n.dir() === 'rtl';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
        { name: t('common.admins'), href: '/admins', icon: Shield },
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
        { name: t('common.banners'), href: '/banners', icon: LayoutGrid },
        { name: t('common.splash'), href: '/splash', icon: Monitor },
        { name: t('common.settings'), href: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 z-30 flex flex-col border-r border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-gray-800/50 dark:bg-gray-900/95 transition-all duration-300",
        isCollapsed ? "w-20" : "w-72",
        // Logic for positioning: start-0 handles LTR (left) and RTL (right) automatically if dir="rtl" is set on html body
        "start-0" 
      )}
    >
      {/* Logo Area */}
      <div className={cn("flex h-20 items-center relative overflow-hidden transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-violet-500/5 dark:from-orange-500/5 dark:to-violet-500/5" />
        <div className="relative z-10 flex items-center gap-3">
          {/* Bayt Car Logo SVG */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          
          <div className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Bayt Car
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        <div className="space-y-6">
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.title} className="animate-slide-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              {!isCollapsed && (
                <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 transition-opacity duration-300">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                        isActive
                          ? "bg-gradient-to-r from-orange-50 to-white text-orange-600 shadow-sm ring-1 ring-orange-100 dark:from-orange-900/20 dark:to-gray-900 dark:text-orange-400 dark:ring-orange-900/40"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200",
                         isCollapsed && "justify-center"
                      )
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-colors duration-200 shrink-0",
                            isActive
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                          )}
                        />
                        <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                          {item.name}
                        </span>
                        {isActive && !isCollapsed && (
                          <div className="absolute end-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-orange-500 opacity-100 transition-opacity" />
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
      <div className="border-t border-gray-100 bg-gray-50/50 p-2 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50 flex flex-col gap-1">
        
        {/* Toggle Sidebar */}
        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("w-full justify-start gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800", isCollapsed && "justify-center")}
        >
          {isRTL ? (isCollapsed ? <ChevronLeft className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>) : (isCollapsed ? <ChevronRight className="h-5 w-5"/> : <ChevronLeft className="h-5 w-5"/>)}
          {!isCollapsed && <span>Collapse</span>}
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn("w-full justify-start gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800", isCollapsed && "justify-center")}
        >
          {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          onClick={toggleLanguage}
          className={cn("w-full justify-start gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-orange-400", isCollapsed && "justify-center")}
        >
          <Globe className="h-5 w-5" />
          {!isCollapsed && <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>}
        </Button>

        {/* Logout */}
        <button className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 group", isCollapsed && "justify-center")}>
          <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          {!isCollapsed && <span>{t('common.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};
