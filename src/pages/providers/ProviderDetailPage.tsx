import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Star,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Briefcase,
  User,
  Calendar,
  Wrench,
  DollarSign,
  Phone,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { providerService, type ProviderDetail } from '../../services/provider.service';
import { format } from 'date-fns';
import { useRolePermissions } from '../../hooks/useRolePermissions';

const getName = (name: string | { en?: string; ar?: string } | undefined) => {
  if (typeof name === 'string') return name;
  return name?.en || name?.ar || '—';
};

const statusBadge = (status: string) => {
  const s = status.toUpperCase();
  if (s === 'COMPLETED')
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
        Completed
      </span>
    );
  if (s === 'ACCEPTED')
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        In progress
      </span>
    );
  if (s === 'OPEN')
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        Open
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
      {status}
    </span>
  );
};

export const ProviderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useRolePermissions();
  const canUpdateProvider = can('PROVIDERS', 'UPDATE');

  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['provider-detail', id],
    queryFn: () => providerService.getProviderDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <p className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Provider not found</p>
        <Button variant="outline" className="mt-6 rounded-xl" onClick={() => navigate('/providers')}>
          Back to Providers
        </Button>
      </div>
    );
  }

  const p = provider as ProviderDetail;
  const requests = p.requests_handled ?? [];
  const servicesPerformed = p.services_performed ?? [];

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Back */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => navigate('/providers')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Providers
        </Button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-8 shadow-2xl dark:from-orange-700 dark:via-orange-800 dark:to-amber-800">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath fill='%23fff' fill-opacity='.12' d='M36 34v-2h-2v2h2zm0-4v-2h-2v2h2zm0-4v-2h-2v2h2z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '60px 60px' }} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {getName(p.businessName)}
              </h1>
              <p className="mt-1 text-white/90">{p.user?.name ?? p.email}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                  <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                  {Number(p.rating).toFixed(1)} Rating
                </span>
                {p.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-sm font-medium text-white">
                    <CheckCircle className="h-4 w-4" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-500/90 px-3 py-1 text-sm font-medium text-white">
                    Pending
                  </span>
                )}
                {p.isSuspended && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-sm font-medium text-white">
                    <AlertTriangle className="h-4 w-4" /> Suspended
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {canUpdateProvider && (
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl bg-white/20 text-white hover:bg-white/30"
                onClick={() => id && navigate(`/providers/${id}/edit`)}
              >
                Edit
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl bg-white/20 text-white hover:bg-white/30"
              onClick={() => navigate('/providers')}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden rounded-2xl border-gray-200 dark:border-gray-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{p.stats?.totalJobs ?? 0}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-2xl border-gray-200 dark:border-gray-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{p.stats?.completedJobs ?? 0}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-2xl border-gray-200 dark:border-gray-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(p.stats?.totalEarnings ?? 0).toFixed(0)} ر.س
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-2xl border-gray-200 dark:border-gray-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                <Wallet className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {p.wallet ? `${Number(p.wallet.balance).toFixed(0)} ر.س` : '—'}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Wallet Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Contact & Bio */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-orange-500" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{p.phone ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{p.email ?? '—'}</span>
              </div>
            </CardContent>
          </Card>
          {getName(p.description) && (
            <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">{getName(p.description)}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Services performed & Recent jobs */}
        <div className="lg:col-span-2 space-y-6">
          {servicesPerformed.length > 0 && (
            <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  Services Performed
                </CardTitle>
                <CardDescription>Services this provider has delivered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {servicesPerformed.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center rounded-xl bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                    >
                      {typeof s.name === 'string' ? s.name : (s as { name?: string }).name ?? '—'}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Calendar className="h-5 w-5 text-orange-500" />
                Recent Jobs
              </CardTitle>
              <CardDescription>Last jobs handled by this provider</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No jobs yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 text-left font-semibold text-gray-500 dark:text-gray-400">Service</th>
                        <th className="pb-3 text-left font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                        <th className="pb-3 text-left font-semibold text-gray-500 dark:text-gray-400">Status</th>
                        <th className="pb-3 text-left font-semibold text-gray-500 dark:text-gray-400">Price</th>
                        <th className="pb-3 text-left font-semibold text-gray-500 dark:text-gray-400">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {requests.slice(0, 10).map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-3 font-medium text-gray-900 dark:text-white">
                            {r.service ? (typeof r.service.name === 'string' ? r.service.name : '—') : '—'}
                          </td>
                          <td className="py-3 text-gray-600 dark:text-gray-300">{r.customer?.name ?? '—'}</td>
                          <td className="py-3">{statusBadge(r.status)}</td>
                          <td className="py-3 text-gray-600 dark:text-gray-300">
                            {r.final_agreed_price != null ? `${Number(r.final_agreed_price).toFixed(0)} ر.س` : '—'}
                          </td>
                          <td className="py-3 text-gray-500 dark:text-gray-400">
                            {r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : '—'}
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
      </div>
    </div>
  );
};
