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

  const textBadge = (href: string) => {
    if (href === '/') return 'Live';
    if (href === '/reports') return 'Data';
    if (href === '/settings') return 'Config';
    return 'Open';
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

  const footerActions = [
    {
      key: 'collapse',
      label: t('sidebar.collapse'),
      icon: isRTL
        ? (isCollapsed ? ChevronLeft : ChevronRight)
        : (isCollapsed ? ChevronRight : ChevronLeft),
      onClick: () => setIsCollapsed(!isCollapsed),
      tone: 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
    },
    {
      key: 'theme',
      label: theme === 'dark' ? t('sidebar.darkMode') : t('sidebar.lightMode'),
      icon: theme === 'dark' ? Moon : Sun,
      onClick: toggleTheme,
      tone: 'text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-300',
    },
    {
      key: 'language',
      label: i18n.language === 'ar' ? 'English' : 'العربية',
      icon: Globe,
      onClick: toggleLanguage,
      tone: 'text-gray-600 hover:text-sky-600 dark:text-gray-300 dark:hover:text-sky-300',
    },
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 z-30 flex flex-col border-r border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,250,251,0.94))] backdrop-blur-2xl shadow-[0_24px_80px_-24px_rgba(15,23,42,0.28)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(10,14,22,0.98))] transition-all duration-300",
        isCollapsed ? "w-20" : "w-72",
        // Logic for positioning: start-0 handles LTR (left) and RTL (right) automatically if dir="rtl" is set on html body
        "start-0" 
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-14 start-6 h-32 w-32 rounded-full bg-orange-500/12 blur-3xl" />
        <div className="absolute top-1/3 -end-10 h-24 w-24 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 start-0 h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Logo Area */}
      <div className={cn("relative mx-3 mt-3 flex min-h-24 items-center overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-md transition-all duration-300 dark:border-white/8 dark:bg-white/5", isCollapsed ? "justify-center px-0 py-3" : "px-4")}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_35%)]" />
        <div className="relative z-10 flex w-full items-center gap-3">
          {/* Bayt Car Logo SVG */}
          <div className={cn("relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 transition-all duration-300", isCollapsed ? "h-14 w-14 rounded-[22px]" : "h-11 w-11")}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
             {isCollapsed && <span className="absolute -end-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-gray-900" />}
          </div>
          
          <div className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
              {t('sidebar.adminPanel')}
            </div>
            <h1 className="mt-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Bayt Car
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('common.dashboard')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-5">
          {navigationGroups.map((group, groupIndex) => (
            <div
              key={group.title}
              className={cn(
                "animate-slide-up rounded-[24px] border border-transparent bg-transparent p-2 transition-all duration-300",
                !isCollapsed && "border-white/60 bg-white/55 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/6 dark:bg-white/4",
                isCollapsed && "mx-auto w-[3.65rem] rounded-[26px] border border-white/50 bg-white/45 py-2 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-white/6 dark:bg-white/5"
              )}
              style={{ animationDelay: `${groupIndex * 90}ms` }}
            >
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 transition-opacity duration-300">
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
                        "group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                        isActive
                          ? "bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(255,255,255,0.95))] text-orange-700 shadow-[0_18px_36px_-28px_rgba(249,115,22,0.65)] ring-1 ring-orange-200/70 dark:bg-[linear-gradient(135deg,rgba(249,115,22,0.2),rgba(255,255,255,0.04))] dark:text-orange-300 dark:ring-orange-500/20"
                          : "text-gray-600 hover:bg-white/75 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/6 dark:hover:text-gray-100",
                         isCollapsed && "justify-center overflow-visible px-0 py-0 h-12 w-12 mx-auto rounded-[20px]"
                      )
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <div className={cn("absolute rounded-full bg-orange-500", isCollapsed ? "inset-x-2 -bottom-1 h-1" : "inset-y-2 start-1 w-1")} />}
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-all duration-200",
                            isActive
                              ? "text-orange-600 dark:text-orange-300"
                              : "text-gray-400 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-200"
                          )}
                        />
                        <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                          {item.name}
                        </span>
                        {isCollapsed && (
                          <span className="pointer-events-none absolute start-[calc(100%+0.85rem)] top-1/2 z-40 -translate-y-1/2 rounded-xl border border-white/70 bg-gray-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 dark:border-white/10 dark:bg-white dark:text-gray-950">
                            {item.name}
                          </span>
                        )}
                        {isActive && !isCollapsed && (
                          <div className="ms-auto rounded-full bg-orange-500/12 px-2 py-1 text-[11px] font-semibold text-orange-700 dark:text-orange-300">
                            {textBadge(item.href)}
                          </div>
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
      <div className="relative border-t border-white/60 bg-white/65 p-3 backdrop-blur-xl dark:border-white/8 dark:bg-white/4">
        {!isCollapsed && (
          <div className="mb-3 rounded-[22px] border border-white/70 bg-[linear-gradient(135deg,rgba(249,115,22,0.12),rgba(255,255,255,0.72))] p-3 dark:border-white/8 dark:bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(255,255,255,0.03))]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              {t('common.settings')}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">
              {theme === 'dark' ? t('sidebar.darkMode') : t('sidebar.lightMode')}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {i18n.language === 'ar' ? 'AR' : 'EN'}
            </p>
          </div>
        )}

        <div className={cn("flex flex-col gap-2", isCollapsed && "items-center")}>
          {footerActions.map((action) => (
            <Button
              key={action.key}
              variant="ghost"
              onClick={action.onClick}
              className={cn(
                "h-11 w-full justify-start gap-3 rounded-2xl border border-transparent bg-transparent px-3 text-sm font-medium transition-all duration-200 hover:border-white/70 hover:bg-white/70 dark:hover:border-white/8 dark:hover:bg-white/6",
                action.tone,
                isCollapsed && "h-12 w-12 justify-center rounded-[18px] border border-white/50 bg-white/55 px-0 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.4)] dark:border-white/8 dark:bg-white/5"
              )}
              title={isCollapsed ? action.label : undefined}
            >
              <action.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{action.label}</span>}
            </Button>
          ))}

          <button
            className={cn(
              "group flex h-11 w-full items-center gap-3 rounded-2xl border border-red-200/70 bg-red-50/80 px-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/8 dark:text-red-300 dark:hover:bg-red-500/12",
              isCollapsed && "h-12 w-12 justify-center rounded-[18px] px-0"
            )}
            title={isCollapsed ? t('common.logout') : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {!isCollapsed && <span>{t('common.logout')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
