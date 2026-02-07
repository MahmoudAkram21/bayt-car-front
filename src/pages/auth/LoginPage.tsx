import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { UserRole } from '../../types';

export const LoginPage = () => {
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

      if (response.user.role !== UserRole.ADMIN && response.user.role !== UserRole.SUPER_ADMIN) {
        setError('Access denied. This portal is for administrators only.');
        setLoading(false);
        return;
      }

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md overflow-hidden rounded-2xl border-gray-200 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="space-y-1 px-6 pt-6">
          <CardTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            Bayt Car Admin
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
    </div>
  );
};
