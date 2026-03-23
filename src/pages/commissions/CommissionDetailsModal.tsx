import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { format } from 'date-fns';
import { DollarSign, Building2, Briefcase, Calendar, CreditCard, Receipt } from 'lucide-react';

interface Commission {
  id: string | number;
  amount: number;
  isPaid: boolean;
  dueDate?: string | null;
  paidAt?: string | null;
  paymentMethod?: string | null;
  rate?: number | null;
  provider?: {
    businessName?: string | { en?: string; ar?: string };
    email?: string;
    phone?: string;
    user?: { name?: string; email?: string; phone?: string };
  };
  booking?: {
    id?: string | number;
    service?: { name?: string | { en?: string; ar?: string } };
    customer?: { name?: string };
    finalPrice?: number;
    final_agreed_price?: number;
    status?: string;
  };
  serviceRequest?: {
    id?: string | number;
    service?: { name?: string | { en?: string; ar?: string } };
    final_agreed_price?: number;
    customer?: { name?: string };
  };
}

interface CommissionDetailsModalProps {
  commission: Commission | null;
  onClose: () => void;
}

const getName = (name: unknown): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object' && name !== null) {
    const n = name as Record<string, string>;
    return n.en || n.ar || '';
  }
  return '';
};

const fmtDate = (val: unknown, fmt = 'PPP') => {
  if (!val) return null;
  try { return format(new Date(val as string), fmt); } catch { return null; }
};

export const CommissionDetailsModal = ({ commission: c, onClose }: CommissionDetailsModalProps) => {
  const providerName =
    c?.provider?.user?.name ||
    getName(c?.provider?.businessName) ||
    '—';

  const serviceName =
    getName(c?.serviceRequest?.service?.name) ||
    getName(c?.booking?.service?.name) ||
    '—';

  const bookingPrice =
    c?.serviceRequest?.final_agreed_price ??
    c?.booking?.final_agreed_price ??
    c?.booking?.finalPrice ??
    null;

  const customerName =
    c?.serviceRequest?.customer?.name ||
    c?.booking?.customer?.name ||
    null;

  return (
    <Dialog open={!!c} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Commission Details</DialogTitle>
            {c && (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold mr-8 ${
                c.isPaid
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              }`}>
                {c.isPaid ? 'Paid' : 'Unpaid'}
              </span>
            )}
          </div>
        </DialogHeader>

        {c && (
          <div className="grid gap-5 mt-2">
            {/* Commission ID */}
            <p className="text-xs text-gray-400">
              ID: <span className="font-mono">{c.id}</span>
            </p>

            {/* Amount hero */}
            <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/10 to-teal-600/5 dark:from-teal-900/30 dark:to-teal-800/20 py-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-teal-500 mx-auto mb-1" />
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {Number(c.amount || 0).toFixed(2)}
                  <span className="text-lg font-normal text-gray-500 ml-1">SAR</span>
                </p>
                {c.rate != null && (
                  <p className="mt-1 text-sm text-gray-500">Rate: {Number(c.rate).toFixed(1)}%</p>
                )}
              </div>
            </div>

            {/* Provider + Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> Provider
                </h3>
                <p className="font-medium text-gray-900 dark:text-white">{providerName}</p>
                {(c.provider?.email || c.provider?.user?.email) && (
                  <p className="mt-1 text-xs text-gray-500">{c.provider?.email || c.provider?.user?.email}</p>
                )}
                {(c.provider?.phone || c.provider?.user?.phone) && (
                  <p className="text-xs text-gray-500">{c.provider?.phone || c.provider?.user?.phone}</p>
                )}
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> Service / Booking
                </h3>
                <p className="font-medium text-gray-900 dark:text-white">{serviceName}</p>
                {customerName && (
                  <p className="mt-1 text-xs text-gray-500">Customer: {customerName}</p>
                )}
                {bookingPrice != null && (
                  <p className="text-xs text-gray-500">Booking total: {Number(bookingPrice).toFixed(2)} SAR</p>
                )}
                {c.booking?.status && (
                  <p className="text-xs text-gray-500">Status: {c.booking.status}</p>
                )}
              </div>
            </div>

            {/* Dates + Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Due Date</p>
                  <p className="mt-0.5 text-gray-800 dark:text-gray-200">{fmtDate(c.dueDate) ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Receipt className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Paid Date</p>
                  <p className="mt-0.5 text-gray-800 dark:text-gray-200">{fmtDate(c.paidAt) ?? '—'}</p>
                </div>
              </div>

              {c.paymentMethod && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Payment Method</p>
                    <p className="mt-0.5 text-gray-800 dark:text-gray-200">{c.paymentMethod}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
