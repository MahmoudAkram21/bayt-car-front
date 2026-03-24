import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { dashboardService, type WalletWithUser } from '../../services/dashboard.service';
import { Wallet, User, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const WalletsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: () => dashboardService.getAllWallets(),
  });

  const wallets = data?.data ?? [];
  const totalBalance = wallets.reduce((sum: number, w: WalletWithUser) => sum + Number(w.balance ?? 0), 0);
  const totalFrozen = wallets.reduce((sum: number, w: WalletWithUser) => sum + Number(w.frozen_balance ?? 0), 0);
  const customerWallets = wallets.filter((w: WalletWithUser) => w.user && !w.user.is_provider);
  const providerWallets = wallets.filter((w: WalletWithUser) => w.user?.is_provider);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t('wallets.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          {t('wallets.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-6 sm:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('wallets.totalWallets')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{wallets.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('wallets.totalBalance')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{totalBalance.toFixed(2)} <span className="text-sm font-normal text-gray-500">SAR</span></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('wallets.frozen')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{totalFrozen.toFixed(2)} <span className="text-sm font-normal text-gray-500">SAR</span></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <User className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Wallet className="h-5 w-5 text-violet-500" />
            {t('wallets.allWallets')}
          </CardTitle>
          <CardDescription>
            {t('wallets.walletsInfo', { total: wallets.length, customers: customerWallets.length, providers: providerWallets.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {t('wallets.loadError')}
            </div>
          )}
          {!isLoading && !error && wallets.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">{t('wallets.noWallets')}</div>
          )}
          {!isLoading && wallets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.id')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.user')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.type')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.balance')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.frozen')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {wallets.map((w: WalletWithUser) => (
                    <tr key={w.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{w.id}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{w.user?.name ?? '—'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{w.user?.email ?? w.user?.phone ?? '—'}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {w.user?.is_provider ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <Building2 className="h-3.5 w-3.5" /> {t('wallets.provider')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <User className="h-3.5 w-3.5" /> {t('wallets.client')}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {Number(w.balance ?? 0).toFixed(2)} ر.س
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {Number(w.frozen_balance ?? 0).toFixed(2)} ر.س
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
