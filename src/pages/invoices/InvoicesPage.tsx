import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { invoiceService, type Invoice } from '../../services/invoice.service';
import api from '../../services/api';
import { FileText, Download, QrCode, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export const InvoicesPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.list(),
  });

  const invoices = data?.data ?? [];
  const paidCount = invoices.filter((i: Invoice) => i.status === 'PAID').length;
  const totalAmount = invoices.reduce((sum: number, i: Invoice) => sum + Number(i.final_paid_amount ?? 0), 0);

  const handleDownloadPdf = async (id: number) => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to download PDF');
    }
  };

  const handleShowQr = async (id: number) => {
    try {
      const res = await api.get(`/invoices/${id}/qr`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const w = window.open(url, '_blank', 'noopener');
      if (w) w.URL.revokeObjectURL = () => {};
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (e) {
      console.error(e);
      alert('Failed to load QR image');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Invoices
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            Invoices for completed orders. PDF export and QR verification.
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total invoices</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{invoices.length}</p>
            </div>
            <FileText className="h-10 w-10 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Paid</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{paidCount}</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-violet-200 bg-violet-50 shadow-sm dark:border-violet-800 dark:bg-violet-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total amount</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{totalAmount.toFixed(2)} ر.س</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="h-5 w-5 text-slate-500" />
            All invoices
          </CardTitle>
          <CardDescription>Invoice number, service, amount, status. Download PDF or view QR.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              Failed to load invoices.
            </div>
          )}
          {!isLoading && !error && invoices.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">No invoices yet.</div>
          )}
          {!isLoading && invoices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.map((i: Invoice) => (
                    <tr key={i.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">{i.invoice_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{i.service_name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{Number(i.final_paid_amount).toFixed(2)} ر.س</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${i.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{format(new Date(i.created_at), 'PP')}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg gap-1" onClick={() => handleDownloadPdf(i.id)}>
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-lg gap-1" onClick={() => handleShowQr(i.id)}>
                            <QrCode className="h-3.5 w-3.5" />
                            QR
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
    </div>
  );
};
