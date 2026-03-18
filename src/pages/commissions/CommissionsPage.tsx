import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, DollarSign, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { commissionService } from '../../services/commission.service';
import { format } from 'date-fns';

type ViewMode = 'cards' | 'table';

export const CommissionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data: stats } = useQuery({
    queryKey: ['commission-stats'],
    queryFn: () => commissionService.getCommissionStats(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['commissions', { isPaid: filterStatus, search: searchTerm }],
    queryFn: () => commissionService.getAllCommissions({
      isPaid: filterStatus === 'paid' ? true : filterStatus === 'unpaid' ? false : undefined,
      search: searchTerm || undefined,
    }),
  });

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Commissions
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Track and manage platform commissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Unpaid</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                ${stats?.totalUnpaid?.toFixed ? Number(stats?.totalUnpaid || 0).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                ${stats?.totalPaid?.toFixed ? Number(stats?.totalPaid || 0).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Suspended Providers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {stats?.suspendedProviders || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-6 rounded-2xl border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <CardContent className="pt-0">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search by provider or booking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-gray-300 pl-10 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
            <div className="flex rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-hidden">
              <button type="button" onClick={() => setViewMode('cards')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-teal-500 text-white dark:bg-teal-600' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'}`}>
                <LayoutGrid className="h-4 w-4" /> Cards
              </button>
              <button type="button" onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-teal-500 text-white dark:bg-teal-600' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'}`}>
                <List className="h-4 w-4" /> List
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <DollarSign className="h-5 w-5 text-teal-500" />
            All Commissions
          </CardTitle>
          <CardDescription>
            {data ? `${(data as any).total ?? (data as any).data?.length ?? 0} commissions found` : 'View and manage commission payments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p>Error loading commissions. Please try again.</p>
            </div>
          )}

          {data && (data as any).data?.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <DollarSign className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No commissions found</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                Try adjusting your search or status filter
              </p>
            </div>
          )}

          {viewMode === 'cards' && data && (data as any).data?.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(data as any).data.map((commission: any) => (
                <div key={commission.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-600">
                  <div className="flex h-24 items-center justify-center bg-gradient-to-br from-teal-500/10 to-teal-600/5 dark:from-teal-900/30 dark:to-teal-800/20">
                    <DollarSign className="h-12 w-12 text-teal-500/70 dark:text-teal-400/60" />
                  </div>
                  <div className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${commission.isPaid ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                      {commission.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{getName(commission.provider?.businessName) || '—'}</h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">${Number(commission.amount || 0).toFixed(2)}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{commission.dueDate ? format(new Date(commission.dueDate), 'MMM dd, yyyy') : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && data && (data as any).data?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Provider</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Booking</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Due Date</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(data as any).data.map((commission: any) => (
                    <tr key={commission.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {getName(commission.provider?.businessName) || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {getName(commission.booking?.service?.name) || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${Number(commission.amount || 0).toFixed(2)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {commission.dueDate ? format(new Date(commission.dueDate), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          commission.isPaid
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {commission.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {commission.isPaid && commission.paidAt ? format(new Date(commission.paidAt), 'MMM dd, yyyy') : '—'}
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
