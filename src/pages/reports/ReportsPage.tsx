import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { reportService, type Report } from '../../services/report.service';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { ReportDetailModal } from './ReportDetailModal';

export const ReportsPage = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', page],
    queryFn: () => reportService.getAll({ page, limit: 10 }),
  });

  const generateMutation = useMutation({
    mutationFn: () => reportService.generateWalletSummary(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const reports = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Reports
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            View and generate reports. Wallet summary and financial reports.
          </p>
        </div>
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
          Generate Wallet Summary
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white/80 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="h-5 w-5 text-violet-500" />
            Saved Reports
          </CardTitle>
          <CardDescription>
            {total} report(s). Generate a wallet summary to add a new report.
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
              Failed to load reports.
            </div>
          )}
          {!isLoading && !error && reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No reports yet</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Click &quot;Generate Wallet Summary&quot; to create your first report.
              </p>
            </div>
          )}
          {!isLoading && reports.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Created</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.map((r: Report) => (
                    <tr key={r.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{r.id}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                          {r.report_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{r.title ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(r)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
