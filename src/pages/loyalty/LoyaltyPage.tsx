import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { loyaltyService, type LoyaltyConfig, type LoyaltyAccountWithUser } from '../../services/loyalty.service';
import { Gift, Users, TrendingUp } from 'lucide-react';

export const LoyaltyPage = () => {
  const { data: configData, isLoading: configLoading, error: configError } = useQuery({
    queryKey: ['loyalty-configs'],
    queryFn: () => loyaltyService.getConfigs(),
  });
  const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: ['loyalty-accounts'],
    queryFn: () => loyaltyService.getAccounts(),
  });

  const configs = configData?.data ?? [];
  const accounts = accountsData?.data ?? [];
  const activeConfig = configs.find((c: LoyaltyConfig) => c.is_active);
  const totalPoints = accounts.reduce((sum: number, a: LoyaltyAccountWithUser) => sum + (a.balance ?? 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Loyalty & Cashback
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Points earning rate, cashback conversion, min redemption. View loyalty accounts.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Active config</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{activeConfig ? 'Yes' : 'None'}</p>
            </div>
            <Gift className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Accounts</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{accounts.length}</p>
            </div>
            <Users className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-violet-200 bg-violet-50 shadow-sm dark:border-violet-800 dark:bg-violet-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total points</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalPoints.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Gift className="h-5 w-5 text-amber-500" />
              Loyalty configs
            </CardTitle>
            <CardDescription>Points per currency, cashback per point, min redemption</CardDescription>
          </CardHeader>
          <CardContent>
            {configLoading && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              </div>
            )}
            {configError && (
              <div className="rounded-xl border border-red-200 bg-red-50 py-6 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                Failed to load configs.
              </div>
            )}
            {!configLoading && !configError && configs.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">No configs yet.</div>
            )}
            {!configLoading && configs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700/70">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Points/currency</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Cashback/point</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Min redeem</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {configs.map((c: LoyaltyConfig) => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{Number(c.points_per_currency)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{Number(c.cashback_per_point)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{c.min_points_redemption}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {c.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-emerald-500" />
              Loyalty accounts
            </CardTitle>
            <CardDescription>Points balance per user</CardDescription>
          </CardHeader>
          <CardContent>
            {accountsLoading && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            )}
            {accountsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 py-6 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                Failed to load accounts.
              </div>
            )}
            {!accountsLoading && !accountsError && accounts.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">No accounts yet.</div>
            )}
            {!accountsLoading && accounts.length > 0 && (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700/70 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">User</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {accounts.map((a: LoyaltyAccountWithUser) => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{a.user?.name ?? `User #${a.user_id}`}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{a.user?.email ?? a.user?.phone ?? '—'}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{a.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
