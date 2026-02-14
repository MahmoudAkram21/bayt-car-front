import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Building2, LayoutGrid, List, AlertTriangle, CheckCircle, Clock, Eye, Pencil, Trash2 } from 'lucide-react';
import { providerService } from '../../services/provider.service';
import { format } from 'date-fns';

const tabs = ['all', 'pending', 'verified', 'suspended'];

export const ProvidersPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => providerService.deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setDeleteTarget(null);
    },
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

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

      {/* Modern Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Providers', value: statTotal, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Pending', value: statPending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Verified', value: statVerified, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Suspended', value: statSuspended, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {stat.value}
                </h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} dark:bg-opacity-20`}>
                <stat.icon className={`h-6 w-6 ${stat.color} dark:text-opacity-90`} />
              </div>
            </div>
          </div>
        ))}
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
                <div key={provider.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-600">
                  <Link to={`/providers/${provider.id}`} className="block">
                    <div className="flex h-24 items-center justify-center bg-gradient-to-br from-orange-500/10 to-amber-600/5 dark:from-orange-900/30 dark:to-amber-800/20">
                      <Building2 className="h-12 w-12 text-orange-500/70 dark:text-orange-400/60" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">{getName(provider.businessName)}</h3>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{getName(provider.owner?.name) || provider.user?.name || '—'}</p>
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
                  </Link>
                  <div className="flex gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-700">
                    <Button variant="ghost" size="sm" className="flex-1 rounded-lg gap-1.5 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20" asChild>
                      <Link to={`/providers/${provider.id}`}>
                        <Eye className="h-4 w-4" /> View
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 rounded-lg gap-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" asChild>
                      <Link to={`/providers/${provider.id}/edit`}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg gap-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => setDeleteTarget({ id: String(provider.id), name: getName(provider.businessName) })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.map((provider: any) => (
                    <tr key={provider.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        <Link to={`/providers/${provider.id}`} className="hover:text-orange-600 dark:hover:text-orange-400">
                          {getName(provider.businessName)}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getName(provider.owner?.name) || provider.user?.name || 'N/A'}</td>
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
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-orange-600 hover:bg-orange-50 dark:text-orange-400" asChild>
                            <Link to={`/providers/${provider.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-gray-600 dark:text-gray-400" asChild>
                            <Link to={`/providers/${provider.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400" onClick={() => setDeleteTarget({ id: String(provider.id), name: getName(provider.businessName) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Provider?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This will remove the provider profile. The user account will remain.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl flex-1">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} className="rounded-xl flex-1" disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
