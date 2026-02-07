import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Calendar, RefreshCw, LayoutGrid, List, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BookingStatus } from '../../types';
import { bookingService } from '../../services/booking.service';
import { format } from 'date-fns';

type ViewMode = 'cards' | 'table';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: BookingStatus.PENDING, label: 'Pending' },
  { value: BookingStatus.CONFIRMED, label: 'Confirmed' },
  { value: BookingStatus.IN_PROGRESS, label: 'In Progress' },
  { value: BookingStatus.COMPLETED, label: 'Completed' },
  { value: BookingStatus.CANCELLED, label: 'Cancelled' },
];

export const BookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', { status: activeTab, search: searchTerm }],
    queryFn: () => bookingService.getAllBookings({
      status: activeTab !== 'all' ? (activeTab as BookingStatus) : undefined,
      search: searchTerm || undefined,
    }),
  });

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      [BookingStatus.PENDING]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      [BookingStatus.CONFIRMED]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      [BookingStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      [BookingStatus.COMPLETED]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      [BookingStatus.CANCELLED]: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const list = (data as any)?.data ?? [];
  const total = (data as any)?.pagination?.total ?? (data as any)?.total ?? list.length;
  const statPending = list.filter((b: any) => b.status === BookingStatus.PENDING).length;
  const statCompleted = list.filter((b: any) => b.status === BookingStatus.COMPLETED).length;
  const statCancelled = list.filter((b: any) => b.status === BookingStatus.CANCELLED).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Bookings
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            View and manage all platform bookings. Switch between cards and table view.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 rounded-xl gap-2 focus:ring-2 focus:ring-teal-500">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stat cards — same style as Commissions */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-600 dark:bg-gray-800/50">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{list.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 shadow-sm">
              <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pending</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{statPending}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Completed</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{statCompleted}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cancelled</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{statCancelled}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-6 rounded-2xl border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <CardContent className="pt-0">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search by customer, provider, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-gray-300 pl-10 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {statusTabs.map((tab) => (
                <option key={tab.value} value={tab.value}>{tab.label}</option>
              ))}
            </select>
            <div className="flex rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-teal-500 text-white dark:bg-teal-600' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-teal-500 text-white dark:bg-teal-600' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <List className="h-4 w-4" /> List
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-teal-500" />
            Bookings
          </CardTitle>
          <CardDescription>
            {data ? `${total} bookings found` : 'View all booking transactions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p>Error loading bookings. Please try again.</p>
            </div>
          )}
          {list.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Calendar className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No bookings found</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">Try adjusting your search or status filter</p>
            </div>
          )}

          {viewMode === 'cards' && list.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((booking: any) => (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-600"
                >
                  <div className="flex h-24 items-center justify-center bg-gradient-to-br from-teal-500/10 to-teal-600/5 dark:from-teal-900/30 dark:to-teal-800/20">
                    <Calendar className="h-12 w-12 text-teal-500/70 dark:text-teal-400/60" />
                  </div>
                  <div className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <h3 className="mt-2 font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {getName(booking.service?.name) || 'Booking'}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{getName(booking.owner?.name) || '—'}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {booking.createdAt ? format(new Date(booking.createdAt), 'MMM dd, yyyy') : '—'}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                      {booking.finalPrice != null ? `${Number(booking.finalPrice).toFixed(2)} ر.س` : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && list.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Service</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Provider</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {list.map((booking: any) => (
                    <tr key={booking.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{getName(booking.owner?.name) || 'N/A'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getName(booking.service?.name) || 'N/A'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getName(booking.provider?.name) || getName(booking.provider?.businessName) || 'N/A'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {booking.createdAt ? format(new Date(booking.createdAt), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {booking.finalPrice != null ? `${Number(booking.finalPrice).toFixed(2)} ر.س` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
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
