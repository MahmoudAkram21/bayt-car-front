import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { promoService, type PromoOffer } from '../../services/promo.service';
import { Tag, Percent } from 'lucide-react';
import { format } from 'date-fns';

export const PromoPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['promo-offers'],
    queryFn: () => promoService.list(),
  });

  const offers = data?.data ?? [];
  const activeCount = offers.filter((o: PromoOffer) => o.is_active).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Promo offers
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Discount codes: percentage or fixed, expiry, usage limits. Scope: all or specific service.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 shadow-sm dark:border-rose-800 dark:bg-rose-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total offers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{offers.length}</p>
            </div>
            <Tag className="h-10 w-10 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Active</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            </div>
            <Percent className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Tag className="h-5 w-5 text-rose-500" />
            All offers
          </CardTitle>
          <CardDescription>Code, type, value, validity, usage</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              Failed to load offers.
            </div>
          )}
          {!isLoading && !error && offers.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">No promo offers yet.</div>
          )}
          {!isLoading && offers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Valid to</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {offers.map((o: PromoOffer) => (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">{o.code}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{o.type}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{o.type === 'PERCENTAGE' ? `${Number(o.value)}%` : Number(o.value)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{o.valid_to ? format(new Date(o.valid_to), 'PP') : '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{o.usage_count}{o.usage_limit != null ? ` / ${o.usage_limit}` : ''}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${o.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {o.is_active ? 'Active' : 'Inactive'}
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
    </div>
  );
};
