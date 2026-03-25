import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../components/theme-provider';
import { Globe, Moon, Sun } from 'lucide-react';

export const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      login(response.user, response.accessToken);
      navigate('/');
    } catch (err: unknown) {
      const ax = err as { code?: string; response?: { data?: { error?: string; message?: string } }; message?: string };
      const isConnectionRefused = ax?.code === 'ERR_NETWORK' || (ax?.message && String(ax.message).toLowerCase().includes('network'));
      const errorMessage = isConnectionRefused
        ? 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الباكند: في مجلد bayt-cat-back نفّذ: npm run dev'
        : ax?.response?.data && typeof ax.response.data === 'object'
          ? (ax.response.data.error || ax.response.data.message) || 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.'
          : ax?.message || 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 dark:bg-gray-900 p-4 relative">
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50"
          title={i18n.language === 'ar' ? 'English' : 'العربية'}
        >
          <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-orange-500" />
          ) : (
            <Moon className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </div>

      <Card className="w-full max-w-md overflow-hidden rounded-2xl border-gray-200 shadow-xl dark:border-gray-700 dark:bg-gray-800 z-10">
        <CardHeader className="space-y-1 px-6 pt-6">
          <CardTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t('common.bioutcar')} Admin
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Sign in to your administrator account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="admin@baytcar.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800" />
              <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                {i18n.language === 'ar' ? 'تذكرني' : 'Remember me'}
              </label>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg hover:from-orange-700 hover:to-orange-800"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Test: admin@baytcar.com / password123
          </p>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex flex-col items-center gap-3 z-10 w-full max-w-md">
        <p className="text-center text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">
          Copyright © {new Date().getFullYear()} · All Rights Reserved
        </p>

        <a
          href="https://www.qeematech.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 px-4 py-2 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800/80 dark:hover:border-orange-900/50 dark:hover:bg-orange-950/20"
        >
          <img
            src="/qeema-logo.svg"
            alt="Qeema Tech Logo"
            className="h-7 w-auto object-contain dark:opacity-90"
          />
          <span className="text-sm font-semibold tracking-tight text-gray-700 dark:text-gray-200">
            Qeema Tech
          </span>
        </a>

        <p className="text-center text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">
          Powered by <span className="text-gray-700 dark:text-gray-300">قيمة تك</span>
        </p>
      </div>
    </div>
  );
};
