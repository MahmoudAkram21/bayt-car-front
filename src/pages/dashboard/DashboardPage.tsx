import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard.service';

export const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold mt-2">
            {isLoading ? '...' : stats?.totalUsers || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">All platform users</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Providers</h3>
          <p className="text-3xl font-bold mt-2">
            {isLoading ? '...' : stats?.activeProviders || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Verified providers</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Bookings</h3>
          <p className="text-3xl font-bold mt-2">
            {isLoading ? '...' : stats?.totalBookings || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">All time bookings</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Revenue</h3>
          <p className="text-3xl font-bold mt-2">
            {isLoading ? '...' : `$${stats?.platformRevenue.toFixed(2) || '0.00'}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">From commissions</p>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome to Bayt Car Admin</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Use the sidebar navigation to manage users, providers, services, bookings, and commissions.
        </p>
      </div>
    </div>
  );
};
