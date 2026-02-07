import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, Building2, LayoutGrid, List, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { providerService } from '../../services/provider.service';
import { format } from 'date-fns';

const tabs = ['all', 'pending', 'verified', 'suspended'];

export const ProvidersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { data, isLoading, error } = useQuery({
    queryKey: ['providers', { verified: activeTab === 'verified', search: searchTerm }],
    queryFn: () => providerService.getAllProviders({
      verified: activeTab === 'verified' ? true : activeTab === 'pending' ? false : undefined,
      search: searchTerm || undefined,
    }),
  });

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  const allProviders = data?.data ?? [];
  const filteredData = allProviders.filter((provider: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return !provider.isVerified;
    if (activeTab === 'verified') return provider.isVerified && !provider.isSuspended;
    if (activeTab === 'suspended') return provider.isSuspended;
    return true;
  });
  const statTotal = allProviders.length;
  const statPending = allProviders.filter((p: any) => !p.isVerified).length;
  const statVerified = allProviders.filter((p: any) => p.isVerified && !p.isSuspended).length;
  const statSuspended = allProviders.filter((p: any) => p.isSuspended).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Service Providers
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Manage and verify service providers
        </p>
      </div>

      {/* Stat cards — same style as Commissions */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-600 dark:bg-gray-800/50">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Providers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{statTotal}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 shadow-sm">
              <Building2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pending</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{statPending}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Verified</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{statVerified}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Suspended</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{statSuspended}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                placeholder="Search by business name or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-gray-300 pl-10 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-600 dark:bg-gray-700/50">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white text-teal-600 shadow dark:bg-gray-600 dark:text-teal-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
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

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Building2 className="h-5 w-5 text-teal-500" />
            {activeTab === 'all' && 'All Providers'}
            {activeTab === 'pending' && 'Pending Verification'}
            {activeTab === 'verified' && 'Verified Providers'}
            {activeTab === 'suspended' && 'Suspended Providers'}
          </CardTitle>
          <CardDescription>
            {data ? `${filteredData.length} providers found` : 'View and manage service providers'}
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
              <p>Error loading providers. Please try again.</p>
            </div>
          )}

          {filteredData.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Building2 className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No providers found</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                Try adjusting your search or tab filter
              </p>
            </div>
          )}

          {viewMode === 'cards' && filteredData.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredData.map((provider: any) => (
                <div key={provider.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-600">
                  <div className="flex h-24 items-center justify-center bg-gradient-to-br from-teal-500/10 to-teal-600/5 dark:from-teal-900/30 dark:to-teal-800/20">
                    <Building2 className="h-12 w-12 text-teal-500/70 dark:text-teal-400/60" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{getName(provider.businessName)}</h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{getName(provider.owner?.name) || '—'}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{getName(provider.city) ?? '—'} · ⭐ {provider.averageRating?.toFixed(1) || '—'}</p>
                    <div className="mt-3">
                      {provider.isSuspended ? (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">Suspended</span>
                      ) : provider.isVerified ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">Verified</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Pending</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{provider.createdAt ? format(new Date(provider.createdAt), 'MMM dd, yyyy') : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && filteredData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Business Name</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Owner</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">City</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rating</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.map((provider: any) => (
                    <tr key={provider.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getName(provider.businessName)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getName(provider.owner?.name) || 'N/A'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getName(provider.city) ?? 'N/A'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">⭐ {provider.averageRating?.toFixed(1) || 'N/A'}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {provider.isSuspended ? (
                          <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">Suspended</span>
                        ) : provider.isVerified ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">Verified</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Pending</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {provider.createdAt ? format(new Date(provider.createdAt), 'MMM dd, yyyy') : '—'}
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
