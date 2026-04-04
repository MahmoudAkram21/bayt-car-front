import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import type { Report } from "../../services/report.service";
import { Wallet, Snowflake, Users, Calendar, Download, FileJson, TrendingUp, Receipt, Percent, Tag, ArrowRightLeft, MapPin, Wrench, BarChart3, Clock, AlertCircle, CheckCircle, UserCheck, UserX, XCircle, Gift, Ticket, Star } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useTranslation } from "react-i18next";
  
  interface ReportDetailModalProps {
    report: Report | null;
    isOpen: boolean;
    onClose: () => void;
  }
  
export const ReportDetailModal = ({ report, isOpen, onClose }: ReportDetailModalProps) => {
    const { t } = useTranslation();
    if (!report) return null;
  
    const isWalletSummary = report.report_type === 'WALLET_SUMMARY';
    const isFinancial = report.report_type === 'FINANCIAL';
    const isServicesByRegion = report.report_type === 'SERVICES_BY_REGION';
    const isOpenAfterPayment = report.report_type === 'OPEN_AFTER_PAYMENT';
    const isUsersDetailed = report.report_type === 'USERS_DETAILED';
    const isCancelledRequests = report.report_type === 'CANCELLED_REQUESTS';
    const isLoyaltyPoints = report.report_type === 'LOYALTY_POINTS';
    const isSupportTickets = report.report_type === 'SUPPORT_TICKETS';
    const isDiscounts = report.report_type === 'DISCOUNTS';
    const isInvoicesByService = report.report_type === 'INVOICES_BY_SERVICE';
    const isServicesIndicators = report.report_type === 'SERVICES_INDICATORS';
    const isProvidersByService = report.report_type === 'PROVIDERS_BY_SERVICE';
    const isProvidersByRating = report.report_type === 'PROVIDERS_BY_RATING';
    const summaryData = report.summary as Record<string, any>;
  
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: 'SAR',
      }).format(amount);
    };

    const formatDate = (value: string) => new Date(value).toLocaleDateString();
    const formatPeriod = (from?: string | null, to?: string | null) => {
      if (!from) return t('reports.summary.allTime');
      return `${formatDate(from)}${to ? ` - ${formatDate(to)}` : ''}`;
    };
    const getReportTitle = () => {
      const labels: Record<string, string> = {
        WALLET_SUMMARY: t('reports.reportTypes.walletSummary', { defaultValue: 'Wallet Summary' }),
        FINANCIAL: t('reports.reportTypes.financial', { defaultValue: 'Financial Report' }),
        SERVICES_BY_REGION: t('reports.reportTypes.servicesRegion', { defaultValue: 'Services by Region' }),
        OPEN_AFTER_PAYMENT: t('reports.reportTypes.openAfterPayment', { defaultValue: 'Open After Payment' }),
        USERS_DETAILED: t('reports.reportTypes.users', { defaultValue: 'Users Report' }),
        CANCELLED_REQUESTS: t('reports.reportTypes.cancelled', { defaultValue: 'Cancelled Requests' }),
        LOYALTY_POINTS: t('reports.reportTypes.loyalty', { defaultValue: 'Loyalty Points' }),
        SUPPORT_TICKETS: t('reports.reportTypes.support', { defaultValue: 'Support Tickets' }),
        DISCOUNTS: t('reports.reportTypes.discounts', { defaultValue: 'Discounts & Cashback' }),
        INVOICES_BY_SERVICE: t('reports.reportTypes.invoices', { defaultValue: 'Invoices by Service' }),
        SERVICES_INDICATORS: t('reports.reportTypes.serviceIndicators', { defaultValue: 'Services Indicators' }),
        PROVIDERS_BY_SERVICE: t('reports.reportTypes.providersByService', { defaultValue: 'Providers by Service' }),
        PROVIDERS_BY_RATING: t('reports.reportTypes.providersByRating', { defaultValue: 'Providers by Rating' }),
      };
      return labels[report.report_type] || report.title || t('reports.details.reportDetails', { defaultValue: 'Report Details' });
    };
    const getRequestStatusLabel = (status?: string) => {
      switch (status) {
        case 'COMPLETED':
          return t('common.completed');
        case 'CANCELLED':
          return t('common.cancelled');
        case 'OPEN':
          return t('common.open');
        default:
          return status ?? '—';
      }
    };
    const getUserRoleLabel = (role?: string) => {
      if (!role) return '—';
      if (role.toLowerCase() === 'provider') return t('reports.details.provider');
      if (role.toLowerCase() === 'customer') return t('reports.details.customer');
      return role;
    };
    const getCancelledByLabel = (value?: string) => {
      switch ((value || '').toUpperCase()) {
        case 'SYSTEM':
          return t('reports.details.cancelledBySystem', { defaultValue: 'System' });
        case 'CUSTOMER':
          return t('reports.details.customer', { defaultValue: 'Customer' });
        case 'PROVIDER':
          return t('reports.details.provider', { defaultValue: 'Provider' });
        case 'ADMIN':
          return t('common.admin', { defaultValue: 'Admin' });
        default:
          return value || '—';
      }
    };
    const getCancellationReasonLabel = (reason?: string) => {
      const normalizedReason = (reason || '').trim().toLowerCase();
      if (normalizedReason.includes('payment not completed') && normalizedReason.includes('configured time limit')) {
        return t('reports.details.paymentTimeoutReason', { defaultValue: 'Payment not completed within the configured time limit' });
      }
      return reason || '—';
    };
    const getCustomerDisplayName = (name?: string) => {
      if (!name) return '—';
      const match = /^Generated Customer\s+(\d+)$/i.exec(name.trim());
      if (match) {
        return t('reports.details.generatedCustomer', {
          defaultValue: 'Generated Customer {{id}}',
          id: match[1],
        });
      }
      return name;
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] min-h-0 flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl">
          <DialogHeader className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isServicesIndicators ? 'bg-indigo-100 dark:bg-indigo-900/30' : isInvoicesByService ? 'bg-teal-100 dark:bg-teal-900/30' : isDiscounts ? 'bg-orange-100 dark:bg-orange-900/30' : isSupportTickets ? 'bg-indigo-100 dark:bg-indigo-900/30' : isLoyaltyPoints ? 'bg-pink-100 dark:bg-pink-900/30' : isCancelledRequests ? 'bg-red-100 dark:bg-red-900/30' : isServicesByRegion ? 'bg-blue-100 dark:bg-blue-900/30' : isFinancial ? 'bg-emerald-100 dark:bg-emerald-900/30' : isOpenAfterPayment ? 'bg-amber-100 dark:bg-amber-900/30' : isUsersDetailed ? 'bg-cyan-100 dark:bg-cyan-900/30' : isProvidersByService ? 'bg-rose-100 dark:bg-rose-900/30' : isProvidersByRating ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                  {isServicesIndicators ? (
                    <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  ) : isInvoicesByService ? (
                    <Receipt className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  ) : isDiscounts ? (
                    <Tag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  ) : isSupportTickets ? (
                    <Ticket className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  ) : isLoyaltyPoints ? (
                    <Gift className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  ) : isCancelledRequests ? (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  ) : isServicesByRegion ? (
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  ) : isFinancial ? (
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  ) : isOpenAfterPayment ? (
                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  ) : isUsersDetailed ? (
                    <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  ) : isProvidersByService ? (
                    <Wrench className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  ) : isProvidersByRating ? (
                    <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Wallet className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {getReportTitle()}
                  </DialogTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.created_at).toLocaleString()}
                    {report.report_type === 'SERVICES_BY_REGION' && summaryData?.periodFrom && (
                      <> • {new Date(summaryData.periodFrom).toLocaleDateString()}{summaryData?.periodTo && ` - ${new Date(summaryData.periodTo).toLocaleDateString()}`}</>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                <Download className="w-4 h-4" />
                {t('reports.export')}
              </Button>
            </div>
          </DialogHeader>
  
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
            {isWalletSummary && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-violet-100 font-medium text-sm">Total Balance</p>
                      <Wallet className="w-5 h-5 text-violet-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      {formatCurrency(summaryData.totalBalance)}
                    </p>
                  </div>
  
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Frozen Amount</p>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Snowflake className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalFrozen)}
                    </p>
                  </div>
  
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Wallets</p>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <Users className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalWallets}
                    </p>
                  </div>
                </div>
  
                {/* Detailed List */}
                {summaryData.byUser && summaryData.byUser.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                       {t('reports.details.detailedBreakdown')}
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('reports.details.user')}</th>
                            <th className="px-6 py-4">{t('reports.details.role')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.balance')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.frozen')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.byUser.map((user: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {user.userName || t('reports.details.unknownUser')}
                                <div className="text-xs text-gray-500 font-normal mt-0.5">ID: {user.userId}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.isProvider 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                  {user.isProvider ? t('reports.details.provider') : t('reports.details.customer')}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                {formatCurrency(user.balance)}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                                {user.frozen > 0 ? (
                                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                                    {formatCurrency(user.frozen)}
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isFinancial && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-emerald-100 font-medium text-sm">{t('reports.summary.totalRevenue')}</p>
                      <TrendingUp className="w-5 h-5 text-emerald-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      {formatCurrency(summaryData.totalRevenue)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.platformCommission')}</p>
                      <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                        <Percent className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalCommissions)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.taxCollected')}</p>
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Receipt className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalTaxCollected)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.totalTransactions')}</p>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <ArrowRightLeft className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalTransactions}
                    </p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.baseRevenue')}</p>
                      <Tag className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalBaseRevenue)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.discountsGiven')}</p>
                      <Tag className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalDiscounts)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.cashbackUsed')}</p>
                      <Tag className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalCashbackUsed)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.providerCommissions')}</p>
                      <Tag className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.providerCommissions)}
                    </p>
                  </div>
                </div>

                {/* Transaction Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-1">{t('reports.details.paidTransactions')}</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{summaryData.paidTransactions}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 font-medium text-sm mb-1">{t('reports.details.refundedTransactions')}</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {summaryData.refundedTransactions} ({formatCurrency(summaryData.refundedAmount)})
                    </p>
                  </div>
                </div>

                {/* Recent Transactions */}
                {summaryData.recentTransactions && summaryData.recentTransactions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {t('reports.summary.recentTransactions')}
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('reports.details.invoice')}</th>
                            <th className="px-6 py-4">{t('reports.details.service')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.base')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.commission')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.tax')}</th>
                            <th className="px-6 py-4 text-right">{t('common.total')}</th>
                            <th className="px-6 py-4">{t('reports.details.status')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.recentTransactions.map((txn: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {txn.invoiceNumber}
                                <div className="text-xs text-gray-500 font-normal mt-0.5">
                                  {new Date(txn.date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{txn.serviceName}</td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {formatCurrency(txn.basePrice)}
                              </td>
                              <td className="px-6 py-4 text-right text-violet-600 dark:text-violet-400">
                                {formatCurrency(txn.platformCommission)}
                              </td>
                              <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400">
                                {formatCurrency(txn.tax)}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                {formatCurrency(txn.finalAmount)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  txn.status === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                  {getRequestStatusLabel(txn.status === 'PAID' ? 'COMPLETED' : txn.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isServicesByRegion && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-blue-100 font-medium text-sm">{t('reports.summary.totalRequests')}</p>
                      <Wrench className="w-5 h-5 text-blue-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      {summaryData.totalRequests}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.totalRegions')}</p>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <MapPin className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalRegions}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.summary.period')}</p>
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPeriod(summaryData.periodFrom, summaryData.periodTo)}
                    </p>
                  </div>
                </div>

                {/* By Region */}
                {summaryData.byRegion && summaryData.byRegion.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      Requests by Region
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('reports.details.region')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.requests')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.percentage')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.byRegion.map((region: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {region.region || t('common.notFound')}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {region.count}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                                {summaryData.totalRequests > 0 ? ((region.count / summaryData.totalRequests) * 100).toFixed(1) : 0}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* By Service */}
                {summaryData.byService && summaryData.byService.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-emerald-500" />
                      Requests by Service
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('reports.details.service')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.requests')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.byService.map((service: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {service.serviceName}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {service.count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* By Status */}
                {summaryData.byStatus && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-violet-500" />
                      Requests by Status
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(summaryData.byStatus).map(([status, count]: [string, any], idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{status}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Requests */}
                {summaryData.recentRequests && summaryData.recentRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      Recent Requests
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('reports.details.service')}</th>
                            <th className="px-6 py-4">{t('common.customer')}</th>
                            <th className="px-6 py-4">{t('reports.details.region')}</th>
                            <th className="px-6 py-4">{t('reports.details.status')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.price')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.recentRequests.map((req: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {req.serviceName}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {req.customerName || '—'}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {req.city || '—'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  req.status === 'COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : req.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                }`}>
                                  {getRequestStatusLabel(req.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {req.price ? formatCurrency(req.price) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isOpenAfterPayment && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-amber-100 font-medium text-sm">Open After Payment</p>
                      <Clock className="w-5 h-5 text-amber-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      {summaryData.openAfterPayment}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Paid</p>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Receipt className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalPaidRequests}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Completed</p>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.completedAfterPayment}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Completion Rate</p>
                      <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                        <Percent className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.completionRate}%
                    </p>
                  </div>
                </div>

                {/* By Status */}
                {summaryData.byStatus && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Open Requests by Status
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(summaryData.byStatus).map(([status, count]: [string, any], idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{status}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Open Requests */}
                {summaryData.recentRequests && summaryData.recentRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      Recent Open Requests
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Provider</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.recentRequests.map((req: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{req.serviceName}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{req.customerName || '—'}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{req.providerName || '—'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                  req.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {req.agreedPrice ? formatCurrency(req.agreedPrice) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isUsersDetailed && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-200 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-cyan-100 font-medium text-sm">{t('reports.summary.totalUsers')}</p>
                      <Users className="w-5 h-5 text-cyan-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">{summaryData.totalUsers}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('dashboard.customers')}</p>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <UserCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{summaryData.totalCustomers}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('dashboard.providers')}</p>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{summaryData.totalProviders}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.details.active')}</p>
                      <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{summaryData.activeUsers}</p>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('reports.details.verifiedProviders')}</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summaryData.verifiedProviders}</p>
                    <p className="text-xs text-gray-400">{summaryData.unverifiedProviders} {t('reports.details.unverified')}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('dashboard.activeUsers')}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryData.activeUsers}</p>
                    <p className="text-xs text-gray-400">{summaryData.inactiveUsers} {t('reports.details.inactive')}</p>
                  </div>
                </div>

                {/* Top Customers */}
                {summaryData.topCustomers && summaryData.topCustomers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-blue-500" />
                      {t('reports.summary.topCustomers')}
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('common.name')}</th>
                            <th className="px-6 py-4">{t('common.phone')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.requests')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.topCustomers.map((user: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.phone || '—'}</td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{user.requestCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Top Providers */}
                {summaryData.topProviders && summaryData.topProviders.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-emerald-500" />
                      {t('reports.summary.topProviders')}
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('common.name')}</th>
                            <th className="px-6 py-4">{t('reports.details.business')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.details.requests')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.topProviders.map((user: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.businessName || '—'}</td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{user.requestCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recent Users */}
                {summaryData.recentUsers && summaryData.recentUsers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {t('reports.details.recentUsers')}
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('common.name')}</th>
                            <th className="px-6 py-4">{t('common.phone')}</th>
                            <th className="px-6 py-4">{t('reports.details.role')}</th>
                            <th className="px-6 py-4">{t('reports.details.status')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.recentUsers.map((user: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.phone || '—'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'Provider' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {getUserRoleLabel(user.role)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 ${user.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {user.isActive ? <CheckCircle className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                  {user.isActive ? t('reports.details.active') : t('reports.details.inactive')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isCancelledRequests && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-red-100 font-medium text-sm">{t('reports.summary.cancelledRequests')}</p>
                      <XCircle className="w-5 h-5 text-red-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">{summaryData.totalCancelled}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('reports.summary.byReason')}</p>
                    <div className="space-y-2 max-h-32 overflow-auto">
                      {summaryData.byReason?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{getCancellationReasonLabel(item.reason)}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('reports.details.cancelledBy', { defaultValue: 'Cancelled By' })}</p>
                    <div className="space-y-2">
                      {summaryData.byCancelledBy?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{getCancelledByLabel(item.cancelledBy)}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {summaryData.recentCancellations && summaryData.recentCancellations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reports.details.recentCancellations', { defaultValue: 'Recent Cancellations' })}</h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3">{t('reports.details.service', { defaultValue: 'Service' })}</th>
                            <th className="px-4 py-3">{t('common.customer')}</th>
                            <th className="px-4 py-3">{t('reports.details.reason', { defaultValue: 'Reason' })}</th>
                            <th className="px-4 py-3">{t('reports.details.cancelledBy', { defaultValue: 'Cancelled By' })}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {summaryData.recentCancellations.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3">{item.serviceName}</td>
                              <td className="px-4 py-3">{getCustomerDisplayName(item.customerName)}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">{getCancellationReasonLabel(item.reason)}</span>
                              </td>
                              <td className="px-4 py-3">{getCancelledByLabel(item.cancelledBy)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isLoyaltyPoints && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-pink-100 font-medium text-sm">{t('reports.summary.totalPointsBalance')}</p>
                      <Gift className="w-5 h-5 text-pink-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">{summaryData.totalPointsBalance?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.summary.totalAccounts')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryData.totalAccounts || 0}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.summary.totalEarned')}</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{summaryData.totalEarned?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Redeemed</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">-{summaryData.totalRedeemed?.toLocaleString() || 0}</p>
                  </div>
                </div>
                {summaryData.topEarners && summaryData.topEarners.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Earners</h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3 text-right">Points Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {summaryData.topEarners.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 font-medium">{item.name}</td>
                              <td className="px-4 py-3">{item.phone}</td>
                              <td className="px-4 py-3 text-right font-bold text-pink-600">{item.balance?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isSupportTickets && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-indigo-100 font-medium text-sm">Total Tickets</p>
                      <Ticket className="w-5 h-5 text-indigo-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">{summaryData.totalTickets}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                    <p className="text-2xl font-bold text-amber-600">{summaryData.openTickets}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{summaryData.inProgressTickets}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-emerald-600">{summaryData.completedTickets}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">Completion Rate</p>
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{summaryData.completionRate}%</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 font-medium text-sm">Cancellation Rate</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">{summaryData.cancellationRate}%</p>
                  </div>
                </div>
              </div>
            ) : isDiscounts && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-orange-100 font-medium text-sm">Total Deductions</p>
                      <Tag className="w-5 h-5 text-orange-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">{formatCurrency(summaryData.totalDeductions)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Discounts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryData.totalDiscounts)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Cashback</p>
                    <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{formatCurrency(summaryData.totalCashback)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryData.totalInvoices}</p>
                  </div>
                </div>
                {summaryData.byService && summaryData.byService.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">By Service</h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3 text-right">Invoices</th>
                            <th className="px-4 py-3 text-right">Discount</th>
                            <th className="px-4 py-3 text-right">Cashback</th>
                            <th className="px-4 py-3 text-right">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {summaryData.byService.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 font-medium">{item.serviceName}</td>
                              <td className="px-4 py-3 text-right">{item.invoiceCount}</td>
                              <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(item.totalDiscount)}</td>
                              <td className="px-4 py-3 text-right text-pink-600">{formatCurrency(item.totalCashback)}</td>
                              <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.totalRevenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isInvoicesByService && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-teal-100 font-medium text-sm">Total Revenue</p>
                      <Receipt className="w-5 h-5 text-teal-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">{formatCurrency(summaryData.totalRevenue)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryData.totalInvoices}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Platform Commission</p>
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{formatCurrency(summaryData.totalCommission)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Tax</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(summaryData.totalTax)}</p>
                  </div>
                </div>
                {summaryData.byService && summaryData.byService.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices by Service</h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3 text-right">Invoices</th>
                            <th className="px-4 py-3 text-right">Base Revenue</th>
                            <th className="px-4 py-3 text-right">Commission</th>
                            <th className="px-4 py-3 text-right">Tax</th>
                            <th className="px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {summaryData.byService.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 font-medium">{item.serviceName}</td>
                              <td className="px-4 py-3 text-right">{item.invoiceCount}</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(item.baseRevenue)}</td>
                              <td className="px-4 py-3 text-right text-violet-600">{formatCurrency(item.commission)}</td>
                              <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(item.tax)}</td>
                              <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isServicesIndicators && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-indigo-100 font-medium text-sm">Total Requests</p>
                      <Wrench className="w-5 h-5 text-indigo-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      {summaryData.totalRequests}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Regions</p>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <MapPin className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalRegions}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Services</p>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <Wrench className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalServices}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Period</p>
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {summaryData.periodFrom ? new Date(summaryData.periodFrom).toLocaleDateString() : 'All Time'}
                      {summaryData.periodTo && ` - ${new Date(summaryData.periodTo).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {/* Top Services by Requests */}
                {summaryData.topServicesByRequests && summaryData.topServicesByRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-emerald-500" />
                      Top Services by Requests
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {summaryData.topServicesByRequests.map((service: Record<string, any>, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {idx + 1}
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{service.totalRequests}</span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">{service.serviceName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Regions by Requests */}
                {summaryData.topRegionsByRequests && summaryData.topRegionsByRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      Top Regions by Requests
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {summaryData.topRegionsByRequests.map((region: Record<string, any>, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              {idx + 1}
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{region.totalRequests}</span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">{region.region}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services by Region */}
                {summaryData.byServiceAndRegion && summaryData.byServiceAndRegion.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-500" />
                      Services by Region
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Region</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4 text-right">Completed</th>
                            <th className="px-6 py-4 text-right">Cancelled</th>
                            <th className="px-6 py-4 text-right">Open</th>
                            <th className="px-6 py-4 text-right">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.byServiceAndRegion.slice(0, 20).map((item: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {item.serviceName}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {item.region}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {item.totalRequests}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {item.completedRequests || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  {item.cancelledRequests || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {item.openRequests || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                {formatCurrency(item.totalRevenue || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Monthly Trend */}
                {summaryData.byMonth && summaryData.byMonth.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      Monthly Trend
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">Month</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4 text-right">Completed</th>
                            <th className="px-6 py-4 text-right">Cancelled</th>
                            <th className="px-6 py-4 text-right">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.byMonth.map((month: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {month.month}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {month.totalRequests}
                              </td>
                              <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">
                                {month.completedRequests}
                              </td>
                              <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">
                                {month.cancelledRequests}
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                {formatCurrency(month.totalRevenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isProvidersByService && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-rose-100 font-medium text-sm">{t('reports.summary.totalProviders')}</p>
                      <Wrench className="w-5 h-5 text-rose-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      {summaryData.totalProviders}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.summary.verifiedProviders')}</p>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <Users className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.verifiedProviders ?? 0}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.summary.period')}</p>
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {summaryData.periodFrom ? new Date(summaryData.periodFrom).toLocaleDateString() : t('reports.summary.allTime')}
                      {summaryData.periodTo && ` - ${new Date(summaryData.periodTo).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {summaryData.byService && summaryData.byService.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-rose-500" />
                      {t('reports.summary.byServiceName')}
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('common.service')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.summary.totalProviders')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.byService.map((item: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {item.serviceName}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {item.providerCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {summaryData.topProviders && summaryData.topProviders.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      {t('reports.summary.topProviders')}
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('common.name')}</th>
                            <th className="px-6 py-4">{t('common.phone')}</th>
                            <th className="px-6 py-4">{t('common.service')}</th>
                            <th className="px-6 py-4 text-right">{t('common.requests')}</th>
                            <th className="px-6 py-4 text-right">{t('common.revenue')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.topProviders.map((provider: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {provider.providerName ?? provider.name ?? '—'}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {provider.providerPhone ?? provider.phone ?? '—'}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {provider.serviceName ?? '—'}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                                {provider.requestCount ?? provider.completedRequests ?? 0}
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                {formatCurrency(provider.totalRevenue ?? provider.revenue ?? 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : isProvidersByRating && summaryData ? (
              <div className="space-y-8 animate-in fade-in-50 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-amber-100 font-medium text-sm">{t('reports.summary.totalProviders')}</p>
                      <Users className="w-5 h-5 text-amber-100 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                      {summaryData.totalProviders}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('reports.summary.totalReviews')}</p>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Star className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalReviews}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Average Rating</p>
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {summaryData.avgRating}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Period</p>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {summaryData.periodFrom ? new Date(summaryData.periodFrom).toLocaleDateString() : t('reports.summary.allTime')}
                      {summaryData.periodTo && ` - ${new Date(summaryData.periodTo).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {summaryData.ratingDistribution && summaryData.ratingDistribution.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-500" />
                      Rating Distribution
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {summaryData.ratingDistribution.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.range}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summaryData.topRated && summaryData.topRated.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      Top Rated Providers
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('common.name')}</th>
                            <th className="px-6 py-4">{t('common.businessName')}</th>
                            <th className="px-6 py-4 text-center">{t('common.rating')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.summary.totalReviews')}</th>
                            <th className="px-6 py-4 text-right">{t('common.requests')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.topRated.map((provider: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {provider.name}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {provider.businessName || '—'}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  <span className="font-medium text-gray-900 dark:text-white">{provider.rating.toFixed(1)}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                                {provider.reviewCount}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                                {provider.requestCount || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {summaryData.mostReviewed && summaryData.mostReviewed.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Most Reviewed Providers
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">{t('common.name')}</th>
                            <th className="px-6 py-4">{t('common.businessName')}</th>
                            <th className="px-6 py-4 text-right">{t('reports.summary.totalReviews')}</th>
                            <th className="px-6 py-4 text-center">{t('common.rating')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.mostReviewed.map((provider: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {provider.name}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                {provider.businessName || '—'}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                                {provider.reviewCount}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  <span className="font-medium text-gray-900 dark:text-white">{provider.rating.toFixed(1)}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <FileJson className="w-4 h-4" />
                    Raw Report Data
                  </div>
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-300 overflow-auto max-h-[400px]">
                    {JSON.stringify(report.summary, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };
