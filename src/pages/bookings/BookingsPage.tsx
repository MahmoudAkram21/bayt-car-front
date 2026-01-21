import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, Calendar } from 'lucide-react';
import { BookingStatus } from '../../types';
import { bookingService } from '../../services/booking.service';
import { format } from 'date-fns';

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

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [BookingStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [BookingStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
      [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all platform bookings
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer, provider, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bookings
          </CardTitle>
          <CardDescription>
            {data ? `${data.total} bookings found` : 'View all booking transactions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center text-gray-500 py-8">
              <p>Loading bookings...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>Error loading bookings. Please try again.</p>
            </div>
          )}

          {data && data.data.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No bookings found.</p>
            </div>
          )}

          {data && data.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.data.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">{getName(booking.owner?.name) || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium">{getName(booking.service?.name) || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getName(booking.provider?.businessName) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {booking.scheduledDate 
                          ? format(new Date(booking.scheduledDate), 'MMM dd, yyyy HH:mm')
                          : 'Not scheduled'}
                      </td>
                      <td className="px-4 py-3 font-medium">${booking.totalPrice?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
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
