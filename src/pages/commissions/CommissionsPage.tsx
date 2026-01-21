import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, DollarSign, AlertTriangle } from 'lucide-react';
import { commissionService } from '../../services/commission.service';
import { format } from 'date-fns';

export const CommissionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: stats } = useQuery({
    queryKey: ['commission-stats'],
    queryFn: () => commissionService.getCommissionStats(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['commissions', { isPaid: filterStatus, search: searchTerm }],
    queryFn: () => commissionService.getAllCommissions({
      isPaid: filterStatus === 'paid' ? true : filterStatus === 'unpaid' ? false : undefined,
      search: searchTerm || undefined,
    }),
  });

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Commissions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage platform commissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Unpaid</p>
                <p className="text-2xl font-bold mt-1">
                  ${stats?.totalUnpaid?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold mt-1">
                  ${stats?.totalPaid?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Suspended Providers</p>
                <p className="text-2xl font-bold mt-1">{stats?.suspendedProviders || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by provider or booking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            All Commissions
          </CardTitle>
          <CardDescription>
            {data ? `${data.total} commissions found` : 'View and manage commission payments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center text-gray-500 py-8">
              <p>Loading commissions...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>Error loading commissions. Please try again.</p>
            </div>
          )}

          {data && data.data.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No commissions found.</p>
            </div>
          )}

          {data && data.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.data.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium">
                        {getName(commission.provider?.businessName) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getName(commission.booking?.service?.name) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-medium">${commission.amount?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {commission.dueDate 
                          ? format(new Date(commission.dueDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          commission.isPaid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {commission.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {commission.isPaid && commission.paidAt
                          ? format(new Date(commission.paidAt), 'MMM dd, yyyy')
                          : '-'}
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
