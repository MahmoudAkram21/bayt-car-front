import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { providerService, type ProviderDetail } from '../../services/provider.service';
import { format } from 'date-fns';
import {
  User, Building2, Phone, Mail, Star, CheckCircle,
  AlertTriangle, Wallet, Briefcase, Calendar, DollarSign, Wrench,
} from 'lucide-react';

interface ProviderDetailsModalProps {
  providerId: string | null;
  onClose: () => void;
}

const getName = (name: string | { en?: string; ar?: string } | undefined | null): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name.en || name.ar || '';
};

const fmtDate = (val: unknown, fmt = 'MMM dd, yyyy') => {
  if (!val) return null;
  try { return format(new Date(val as string), fmt); } catch { return null; }
};

const statusColor = (status: string) => {
  const s = status.toUpperCase();
  if (s === 'COMPLETED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (s === 'ACCEPTED') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  if (s === 'CANCELLED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
};

export const ProviderDetailsModal = ({ providerId, onClose }: ProviderDetailsModalProps) => {
  const { data: provider, isLoading, error } = useQuery<ProviderDetail>({
    queryKey: ['provider-detail-modal', providerId],
    queryFn: () => providerService.getProviderDetail(providerId!),
    enabled: !!providerId,
  });

  const p = provider as ProviderDetail | undefined;

  return (
    <Dialog open={!!providerId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Provider Details</DialogTitle>
            {p && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold mr-8 ${
                p.isSuspended
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : p.isVerified
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                {p.isSuspended ? <><AlertTriangle className="h-3 w-3" /> Suspended</> : p.isVerified ? <><CheckCircle className="h-3 w-3" /> Verified</> : 'Pending'}
              </span>
            )}
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
            Error loading provider details.
          </div>
        )}

        {p && (
          <div className="grid gap-6 mt-2">
            {/* Provider ID */}
            <p className="text-xs text-gray-400">
              ID: <span className="font-mono">{p.id}</span>
            </p>

            {/* Identity + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identity */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" /> Provider Info
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p className="font-medium text-base text-gray-900 dark:text-white">
                    {getName(p.businessName) || p.user?.name || 'Unknown Provider'}
                  </p>
                  {getName(p.description) && (
                    <p className="text-xs italic">{getName(p.description)}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{p.phone || p.user?.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{p.email || p.user?.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" />
                    <span>{Number(p.rating).toFixed(1)} Rating</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-orange-500" /> Stats
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-white dark:bg-gray-800 p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{p.stats?.totalJobs ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Jobs</p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-gray-800 p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-emerald-600">{p.stats?.completedJobs ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Completed</p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-gray-800 p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-amber-600">{(p.stats?.totalEarnings ?? 0).toFixed(0)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Earnings (SAR)</p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-gray-800 p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-violet-600">
                      {p.wallet ? Number(p.wallet.balance).toFixed(0) : '—'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Wallet (SAR)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Performed */}
            {p.services_performed && p.services_performed.length > 0 && (
              <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-500" /> Services Performed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {p.services_performed.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                    >
                      {typeof s.name === 'string' ? s.name : '—'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Jobs */}
            <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" /> Recent Jobs
              </h3>
              {!p.requests_handled || p.requests_handled.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No jobs yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-500 uppercase">
                        <th className="pb-2">Service</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 flex items-center gap-1"><DollarSign className="h-3 w-3" />Price</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {p.requests_handled.slice(0, 8).map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-2 font-medium text-gray-900 dark:text-white">
                            {r.service ? (typeof r.service.name === 'string' ? r.service.name : '—') : '—'}
                          </td>
                          <td className="py-2 text-gray-600 dark:text-gray-300">{r.customer?.name ?? '—'}</td>
                          <td className="py-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2 text-gray-600 dark:text-gray-300">
                            {r.final_agreed_price != null ? `${Number(r.final_agreed_price).toFixed(0)} SAR` : '—'}
                          </td>
                          <td className="py-2 text-gray-500 dark:text-gray-400">
                            {fmtDate(r.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
