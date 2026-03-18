import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { reportService, type Report } from '../../services/report.service';
import { FileText, Plus, RefreshCw, Clock, Users, XCircle, Ticket, Gift, Receipt, Tag, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReportDetailModal } from './ReportDetailModal';
import { useTranslation } from 'react-i18next';

const REPORTS_PAGE_SIZE = 15;

export const ReportsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', page],
    queryFn: () => reportService.getAll({ page, limit: REPORTS_PAGE_SIZE }),
  });

  const generateMutation = useMutation({
    mutationFn: () => reportService.generateWalletSummary(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateFinancialMutation = useMutation({
    mutationFn: () => reportService.generateFinancialSummary(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateServicesByRegionMutation = useMutation({
    mutationFn: () => reportService.generateServicesByRegion(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateOpenAfterPaymentMutation = useMutation({
    mutationFn: () => reportService.generateOpenAfterPayment(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateUsersDetailedMutation = useMutation({
    mutationFn: () => reportService.generateUsersDetailed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateCancelledRequestsMutation = useMutation({
    mutationFn: () => reportService.generateCancelledRequests(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateLoyaltyPointsMutation = useMutation({
    mutationFn: () => reportService.generateLoyaltyPoints(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateSupportTicketsMutation = useMutation({
    mutationFn: () => reportService.generateSupportTickets(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateDiscountsMutation = useMutation({
    mutationFn: () => reportService.generateDiscounts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateInvoicesByServiceMutation = useMutation({
    mutationFn: () => reportService.generateInvoicesByService(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateServicesIndicatorsMutation = useMutation({
    mutationFn: () => reportService.generateServicesIndicators(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateProvidersByServiceMutation = useMutation({
    mutationFn: () => reportService.generateProvidersByService(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const generateProvidersByRatingMutation = useMutation({
    mutationFn: () => reportService.generateProvidersByRating(),
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
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-violet-600 shadow-lg gap-2 hover:bg-violet-700 focus:ring-2 focus:ring-violet-500"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t('reports.reportTypes.walletSummary')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-emerald-600 shadow-lg gap-2 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500"
            onClick={() => generateFinancialMutation.mutate()}
            disabled={generateFinancialMutation.isPending}
          >
            {generateFinancialMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t('reports.reportTypes.financial')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-blue-600 shadow-lg gap-2 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            onClick={() => generateServicesByRegionMutation.mutate()}
            disabled={generateServicesByRegionMutation.isPending}
          >
            {generateServicesByRegionMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t('reports.reportTypes.servicesRegion')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-amber-600 shadow-lg gap-2 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500"
            onClick={() => generateOpenAfterPaymentMutation.mutate()}
            disabled={generateOpenAfterPaymentMutation.isPending}
          >
            {generateOpenAfterPaymentMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            {t('reports.reportTypes.openAfterPayment')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-cyan-600 shadow-lg gap-2 hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500"
            onClick={() => generateUsersDetailedMutation.mutate()}
            disabled={generateUsersDetailedMutation.isPending}
          >
            {generateUsersDetailedMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {t('reports.reportTypes.users')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-red-600 shadow-lg gap-2 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
            onClick={() => generateCancelledRequestsMutation.mutate()}
            disabled={generateCancelledRequestsMutation.isPending}
          >
            {generateCancelledRequestsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {t('reports.reportTypes.cancelled')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-pink-600 shadow-lg gap-2 hover:bg-pink-700 focus:ring-2 focus:ring-pink-500"
            onClick={() => generateLoyaltyPointsMutation.mutate()}
            disabled={generateLoyaltyPointsMutation.isPending}
          >
            {generateLoyaltyPointsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Gift className="h-4 w-4" />
            )}
            {t('reports.reportTypes.loyalty')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-indigo-600 shadow-lg gap-2 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
            onClick={() => generateSupportTicketsMutation.mutate()}
            disabled={generateSupportTicketsMutation.isPending}
          >
            {generateSupportTicketsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Ticket className="h-4 w-4" />
            )}
            {t('reports.reportTypes.support')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-orange-600 shadow-lg gap-2 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500"
            onClick={() => generateDiscountsMutation.mutate()}
            disabled={generateDiscountsMutation.isPending}
          >
            {generateDiscountsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Tag className="h-4 w-4" />
            )}
            {t('reports.reportTypes.discounts')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-teal-600 shadow-lg gap-2 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500"
            onClick={() => generateInvoicesByServiceMutation.mutate()}
            disabled={generateInvoicesByServiceMutation.isPending}
          >
            {generateInvoicesByServiceMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4" />
            )}
            {t('reports.reportTypes.invoices')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-indigo-600 shadow-lg gap-2 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
            onClick={() => generateServicesIndicatorsMutation.mutate()}
            disabled={generateServicesIndicatorsMutation.isPending}
          >
            {generateServicesIndicatorsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {t('reports.reportTypes.serviceIndicators')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-rose-600 shadow-lg gap-2 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500"
            onClick={() => generateProvidersByServiceMutation.mutate()}
            disabled={generateProvidersByServiceMutation.isPending}
          >
            {generateProvidersByServiceMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {t('reports.reportTypes.providersByService')}
          </Button>
          <Button
            size="sm"
            className="shrink-0 rounded-xl bg-amber-600 shadow-lg gap-2 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500"
            onClick={() => generateProvidersByRatingMutation.mutate()}
            disabled={generateProvidersByRatingMutation.isPending}
          >
            {generateProvidersByRatingMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {t('reports.reportTypes.providersByRating')}
          </Button>
        </div>
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
