  import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
  import type { Report } from "../../services/report.service";
  import { ScrollArea } from "../../components/ui/scroll-area";
  import { Wallet, Snowflake, Users, Calendar, Download, FileJson } from "lucide-react";
  import { Button } from "../../components/ui/button";
  
  interface ReportDetailModalProps {
    report: Report | null;
    isOpen: boolean;
    onClose: () => void;
  }
  
  export const ReportDetailModal = ({ report, isOpen, onClose }: ReportDetailModalProps) => {
    if (!report) return null;
  
    const isWalletSummary = report.report_type === 'WALLET_SUMMARY';
    const summaryData = report.summary as Record<string, any>;
  
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-SA', {
        style: 'currency',
        currency: 'SAR',
      }).format(amount);
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <Wallet className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {report.title ?? 'Report Details'}
                  </DialogTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </DialogHeader>
  
          <ScrollArea className="flex-1 p-6">
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
                       Detailed Breakdown
                    </h3>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4 text-right">Balance</th>
                            <th className="px-6 py-4 text-right">Frozen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {summaryData.byUser.map((user: Record<string, any>, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {user.userName || 'Unknown User'}
                                <div className="text-xs text-gray-500 font-normal mt-0.5">ID: {user.userId}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.isProvider 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                  {user.isProvider ? 'Provider' : 'Customer'}
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };
