import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { reportService, type Report } from '../../services/report.service';
import { FileText, Plus, RefreshCw, Clock, Users, XCircle, Ticket, Gift, Receipt, Tag, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReportDetailModal } from './ReportDetailModal';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const REPORTS_PAGE_SIZE = 15;

const REPORT_TYPE_OPTIONS = [
  { value: 'WALLET_SUMMARY', labelKey: 'reports.reportTypes.walletSummary', icon: Plus, className: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500' },
  { value: 'FINANCIAL', labelKey: 'reports.reportTypes.financial', icon: Plus, className: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' },
  { value: 'SERVICES_BY_REGION', labelKey: 'reports.reportTypes.servicesRegion', icon: Plus, className: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' },
  { value: 'OPEN_AFTER_PAYMENT', labelKey: 'reports.reportTypes.openAfterPayment', icon: Clock, className: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' },
  { value: 'USERS_DETAILED', labelKey: 'reports.reportTypes.users', icon: Users, className: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500' },
  { value: 'CANCELLED_REQUESTS', labelKey: 'reports.reportTypes.cancelled', icon: XCircle, className: 'bg-red-600 hover:bg-red-700 focus:ring-red-500' },
  { value: 'LOYALTY_POINTS', labelKey: 'reports.reportTypes.loyalty', icon: Gift, className: 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-500' },
  { value: 'SUPPORT_TICKETS', labelKey: 'reports.reportTypes.support', icon: Ticket, className: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' },
  { value: 'DISCOUNTS', labelKey: 'reports.reportTypes.discounts', icon: Tag, className: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' },
  { value: 'INVOICES_BY_SERVICE', labelKey: 'reports.reportTypes.invoices', icon: Receipt, className: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500' },
  { value: 'SERVICES_INDICATORS', labelKey: 'reports.reportTypes.serviceIndicators', icon: BarChart3, className: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' },
  { value: 'PROVIDERS_BY_SERVICE', labelKey: 'reports.reportTypes.providersByService', icon: Users, className: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' },
  { value: 'PROVIDERS_BY_RATING', labelKey: 'reports.reportTypes.providersByRating', icon: Users, className: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' },
] as const;

type ReportTypeValue = typeof REPORT_TYPE_OPTIONS[number]['value'];

export const ReportsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<ReportTypeValue>('WALLET_SUMMARY');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', page],
    queryFn: () => reportService.getAll({ page, limit: REPORTS_PAGE_SIZE }),
  });

  const generateReportMutation = useMutation({
    mutationFn: async ({ reportType, from, to }: { reportType: ReportTypeValue; from: string; to: string }) => {
      const generatorMap: Record<ReportTypeValue, (period_from?: string, period_to?: string) => Promise<Report>> = {
        WALLET_SUMMARY: reportService.generateWalletSummary,
        FINANCIAL: reportService.generateFinancialSummary,
        SERVICES_BY_REGION: reportService.generateServicesByRegion,
        OPEN_AFTER_PAYMENT: reportService.generateOpenAfterPayment,
        USERS_DETAILED: reportService.generateUsersDetailed,
        CANCELLED_REQUESTS: reportService.generateCancelledRequests,
        LOYALTY_POINTS: reportService.generateLoyaltyPoints,
        SUPPORT_TICKETS: reportService.generateSupportTickets,
        DISCOUNTS: reportService.generateDiscounts,
        INVOICES_BY_SERVICE: reportService.generateInvoicesByService,
        SERVICES_INDICATORS: reportService.generateServicesIndicators,
        PROVIDERS_BY_SERVICE: reportService.generateProvidersByService,
        PROVIDERS_BY_RATING: reportService.generateProvidersByRating,
      };

      return generatorMap[reportType](from, to);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const reports = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / REPORTS_PAGE_SIZE));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const activeReportOption = REPORT_TYPE_OPTIONS.find((option) => option.value === selectedReportType) ?? REPORT_TYPE_OPTIONS[0];
  const ActiveReportIcon = activeReportOption.icon;

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      WALLET_SUMMARY: t('reports.reportTypes.walletSummary'),
      FINANCIAL: t('reports.reportTypes.financial'),
      SERVICES_BY_REGION: t('reports.reportTypes.servicesRegion'),
      OPEN_AFTER_PAYMENT: t('reports.reportTypes.openAfterPayment'),
      USERS_DETAILED: t('reports.reportTypes.users'),
      CANCELLED_REQUESTS: t('reports.reportTypes.cancelled'),
      LOYALTY_POINTS: t('reports.reportTypes.loyalty'),
      SUPPORT_TICKETS: t('reports.reportTypes.support'),
      DISCOUNTS: t('reports.reportTypes.discounts'),
      INVOICES_BY_SERVICE: t('reports.reportTypes.invoices'),
      SERVICES_INDICATORS: t('reports.reportTypes.serviceIndicators'),
      PROVIDERS_BY_SERVICE: t('reports.reportTypes.providersByService'),
      PROVIDERS_BY_RATING: t('reports.reportTypes.providersByRating'),
    };
    return labels[type] || type;
  };

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      WALLET_SUMMARY: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      FINANCIAL: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      SERVICES_BY_REGION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      OPEN_AFTER_PAYMENT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      USERS_DETAILED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      CANCELLED_REQUESTS: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      LOYALTY_POINTS: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      SUPPORT_TICKETS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      DISCOUNTS: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      INVOICES_BY_SERVICE: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      SERVICES_INDICATORS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      PROVIDERS_BY_SERVICE: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      PROVIDERS_BY_RATING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const handleGenerateReport = () => {
    if (!selectedReportType) {
      toast.error(t('reports.form.validation.selectType'));
      return;
    }

    if (!periodFrom || !periodTo) {
      toast.error(t('reports.form.validation.selectDateRange'));
      return;
    }

    if (periodFrom > periodTo) {
      toast.error(t('reports.form.validation.invalidDateRange'));
      return;
    }

    generateReportMutation.mutate({
      reportType: selectedReportType,
      from: periodFrom,
      to: periodTo,
    });
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {t('reports.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
            {t('reports.subtitle')}
          </p>
        </div>
      </div>

      {/* Generate reports — modern pill grid */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            {t('reports.generate')}
          </CardTitle>
          <CardDescription className="text-sm">
            {t('reports.generateNew')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]">
            <div className="space-y-2">
              <label htmlFor="reportType" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('reports.form.type')}
              </label>
              <select
                id="reportType"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value as ReportTypeValue)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {REPORT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="periodFrom" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('reports.form.from')}
              </label>
              <Input
                id="periodFrom"
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
                max={periodTo || undefined}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="periodTo" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('reports.form.to')}
              </label>
              <Input
                id="periodTo"
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
                min={periodFrom || undefined}
              />
            </div>

            <div className="flex items-end">
              <Button
                className={`h-10 w-full rounded-xl shadow-lg gap-2 focus:ring-2 ${activeReportOption.className}`}
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending}
              >
                {generateReportMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ActiveReportIcon className="h-4 w-4" />
                )}
                {t('reports.form.generate')}
              </Button>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {t('reports.form.hint')}
          </p>
        </CardContent>
      </Card>

      {/* Saved reports table */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="h-5 w-5 text-violet-500" />
            {t('reports.savedReports')}
          </CardTitle>
          <CardDescription>
            {t('reports.reportCount', { count: total })}. {t('reports.generateNew')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {t('reports.loadError')}
            </div>
          )}
          {!isLoading && !error && reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{t('reports.empty.noReports')}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('reports.empty.clickToGenerate')}
              </p>
            </div>
          )}
          {!isLoading && reports.length > 0 && (
            <>
              <div className="overflow-x-auto -mx-px">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 rounded-tl-lg">{t('reports.type')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.name')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('reports.created')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 rounded-tr-lg">{t('reports.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                    {reports.map((r: Report) => (
                      <tr key={String(r.id)} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getReportTypeColor(r.report_type)}`}>
                            {getReportTypeLabel(r.report_type)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">{r.title ?? '—'}</td>
                        <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                          {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20"
                            onClick={() => setSelectedReport(r)}
                          >
                            {t('reports.view')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {total > REPORTS_PAGE_SIZE && (
                <div className="flex items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-700/80 px-4 py-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('reports.reportCount', { count: total })} · {page} / {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={!hasPrev}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[4rem] text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={!hasNext}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};
