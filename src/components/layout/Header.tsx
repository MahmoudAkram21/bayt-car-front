import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-provider';
import { Button } from '../ui/button';
import { LogOut, User, Moon, Sun, Globe, Menu, X } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Header = ({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserName = () => {
    if (!user?.name) return 'Admin User';
    if (typeof user.name === 'string') return user.name;
    return user.name.en || user.name.ar || 'Admin User';
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:h-16">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden h-9 w-9 rounded-lg"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
          
          <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
            Admin Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700"
            title={i18n.language === 'ar' ? 'English' : 'العربية'}
          >
            <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700"
            title={theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-orange-500" />
            ) : (
              <Moon className="h-4 w-4 text-gray-600" />
            )}
          </Button>

          {/* User — Design System: avatar with orange gradient */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-md sm:h-10 sm:w-10">
              <User className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div className="hidden md:block text-start">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getUserName()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 rounded-xl border-gray-300 dark:border-gray-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
