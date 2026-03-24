import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { invoiceService, type Invoice } from '../../services/invoice.service';
import api from '../../services/api';
import { FileText, Download, QrCode, RefreshCw, Plus, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export const InvoicesPage = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [serviceRequestId, setServiceRequestId] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (id: number) => invoiceService.createForServiceRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowCreateForm(false);
      setServiceRequestId('');
    },
  });

  const invoices = data?.data ?? [];
  const paidCount = invoices.filter((i: Invoice) => i.status === 'PAID').length;
  const totalAmount = invoices.reduce((sum: number, i: Invoice) => sum + Number(i.final_paid_amount ?? 0), 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(serviceRequestId, 10);
    if (Number.isNaN(id)) return;
    createMutation.mutate(id);
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = (window as any).URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      (window as any).URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('فشل تحميل PDF');
    }
  };

  const handleShowQr = async (id: number) => {
    try {
      const res = await api.get(`/invoices/${id}/qr`, { responseType: 'blob' });
      const url = (window as any).URL.createObjectURL(new Blob([res.data]));
      const w = window.open(url, '_blank', 'noopener');
      if (w) (w as any).URL.revokeObjectURL = () => {};
      setTimeout(() => (window as any).URL.revokeObjectURL(url), 10000);
    } catch (e) {
      console.error(e);
      alert('فشل تحميل صورة QR');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            الفواتير
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            فواتير الطلبات المكتملة. تصدير PDF والتحقق عبر QR.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" className="rounded-xl bg-slate-600 gap-2 hover:bg-slate-700" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            إنشاء فاتورة لطلب خدمة
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className="mb-6 rounded-2xl border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">إنشاء فاتورة لطلب خدمة</CardTitle>
            <CardDescription>أدخل رقم طلب الخدمة (Service Request ID) لإنشاء فاتورة مرتبطة به.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvoice} className="flex flex-wrap items-end gap-4">
              <div>
                <Label>رقم طلب الخدمة</Label>
                <Input type="number" min="1" value={serviceRequestId} onChange={(e) => setServiceRequestId(e.target.value)} placeholder="مثال: 1" className="mt-1 w-40 rounded-lg" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="rounded-lg" disabled={createMutation.isPending}>
                  إنشاء الفاتورة
                </Button>
                <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => { setShowCreateForm(false); setServiceRequestId(''); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-6 sm:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي الفواتير</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{invoices.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">مدفوعة</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{paidCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي المبلغ</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{totalAmount.toFixed(2)} <span className="text-sm font-normal text-gray-500">ر.س</span></p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="h-5 w-5 text-slate-500" />
            جميع الفواتير
          </CardTitle>
          <CardDescription>رقم الفاتورة، الخدمة، المبلغ، الحالة. تحميل PDF أو عرض QR.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              فشل تحميل الفواتير.
            </div>
          )}
          {!isLoading && !error && invoices.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">لا توجد فواتير بعد. استخدم &quot;إنشاء فاتورة لطلب خدمة&quot; إن كان لديك طلب خدمة.</div>
          )}
          {!isLoading && invoices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">رقم الفاتورة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الخدمة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">المبلغ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">التاريخ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">إجراءات</th>
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
