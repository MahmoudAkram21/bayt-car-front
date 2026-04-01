import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { invoiceService, type Invoice } from '../../services/invoice.service';
import api from '../../services/api';
import { FileText, Download, QrCode, RefreshCw, Plus, DollarSign, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { useRolePermissions } from '../../hooks/useRolePermissions';

export const InvoicesPage = () => {
  const { t } = useTranslation();
  const { can } = useRolePermissions();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [serviceRequestId, setServiceRequestId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const canCreateInvoices = can('INVOICES', 'CREATE');

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
    if (!canCreateInvoices) return;
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
      alert(t('invoicesPage.pdfLoadError'));
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
      alert(t('invoicesPage.qrLoadError'));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('invoicesPage.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t('invoicesPage.description')}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            {t('invoicesPage.refresh')}
          </Button>
          {canCreateInvoices && <Button size="sm" className="rounded-xl bg-slate-600 gap-2 hover:bg-slate-700" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            {t('invoicesPage.createInvoice')}
          </Button>}
        </div>
      </div>

      {showCreateForm && (
        <Card className="mb-6 rounded-2xl border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">{t('invoicesPage.createInvoice')}</CardTitle>
            <CardDescription>{t('invoicesPage.createInvoiceDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvoice} className="flex flex-wrap items-end gap-4">
              <fieldset disabled={!canCreateInvoices || createMutation.isPending} className="contents">
              <div>
                <Label>{t('invoicesPage.serviceRequestId')}</Label>
                <Input type="number" min="1" value={serviceRequestId} onChange={(e) => setServiceRequestId(e.target.value)} placeholder={t('invoicesPage.serviceRequestIdPlaceholder')} className="mt-1 w-40 rounded-lg" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="rounded-lg" disabled={!canCreateInvoices || createMutation.isPending}>
                  {t('invoicesPage.createInvoice')}
                </Button>
                <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => { setShowCreateForm(false); setServiceRequestId(''); }}>
                  {t('invoicesPage.cancel')}
                </Button>
              </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-6 sm:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('invoicesPage.totalInvoices')}</p>
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('invoicesPage.paid')}</p>
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('invoicesPage.totalAmount')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{totalAmount.toFixed(2)} <span className="text-sm font-normal text-gray-500">{t('dashboard.sar')}</span></p>
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
            {t('invoicesPage.allInvoices')}
          </CardTitle>
          <CardDescription>{t('invoicesPage.allInvoicesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {t('invoicesPage.loadError')}
            </div>
          )}
          {!isLoading && !error && invoices.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">{t('invoicesPage.noInvoices')}</div>
          )}
          {!isLoading && invoices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('invoicesPage.invoiceId')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('invoicesPage.service')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('invoicesPage.amount')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('invoicesPage.status')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('invoicesPage.date')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('invoicesPage.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.map((i: Invoice) => (
                    <tr key={i.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">{i.invoice_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{i.service_name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{Number(i.final_paid_amount).toFixed(2)} {t('dashboard.sar')}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${i.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                          {t(`invoicesPage.status_${i.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{format(new Date(i.created_at), 'PP')}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg gap-1" onClick={() => setSelectedInvoice(i)}>
                            <Calculator className="h-3.5 w-3.5" />
                            {t('invoicesPage.details')}
                          </Button>
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

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('invoicesPage.invoiceDetails')}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('invoicesPage.invoiceNumber')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedInvoice.invoice_number}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('invoicesPage.basePrice')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Number(selectedInvoice.base_price).toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('invoicesPage.platformCommission')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Number(selectedInvoice.commission_amount).toFixed(2)} SAR</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('invoicesPage.subtotal')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{(Number(selectedInvoice.base_price) + Number(selectedInvoice.commission_amount)).toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('invoicesPage.tax')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Number(selectedInvoice.tax_amount).toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>{t('invoicesPage.discount')}</span>
                  <span>-{Number(selectedInvoice.discount_amount).toFixed(2)} SAR</span>
                </div>
                {selectedInvoice.cashback_used > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>{t('invoicesPage.cashback')}</span>
                    <span>-{Number(selectedInvoice.cashback_used).toFixed(2)} SAR</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">{t('invoicesPage.finalAmount')}</span>
                  <span className="text-emerald-600">{Number(selectedInvoice.final_paid_amount).toFixed(2)} SAR</span>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>{t('invoicesPage.formula')}:</strong> {
                    selectedInvoice.cashback_used > 0 
                      ? t('invoicesPage.formulaTextWithDiscountAndCashback')
                      : selectedInvoice.discount_amount > 0 
                        ? t('invoicesPage.formulaTextWithDiscountNoCashback')
                        : t('invoicesPage.formulaTextNoDiscountNoCashback')
                  }
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
