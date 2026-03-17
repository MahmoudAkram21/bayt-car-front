import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar, Shield, Award, Wallet, Activity } from 'lucide-react';
import { userService } from '../../services/user.service';
import { adminUsersService, type AdminUser } from '../../services/adminUsers.service';
import { format } from 'date-fns';
import { UserRole } from '../../types';

type UserType = 'app' | 'admin';

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = (searchParams.get('type') as UserType) || 'app';

  const appQuery = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id && type === 'app',
  });

  const adminQuery = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminUsersService.getById(id!),
    enabled: !!id && type === 'admin',
  });

  const isApp = type === 'app';
  const { data: user } = isApp ? appQuery : adminQuery;
  const isLoadingAny = appQuery.isLoading || adminQuery.isLoading;
  const errorAny = appQuery.error || adminQuery.error;

  if (isLoadingAny) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (errorAny || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
          <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">User not found</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">The user you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/users')} variant="outline" className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      [UserRole.OWNER]: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      [UserRole.PROVIDER]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      [UserRole.ADMIN]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  if (type === 'admin') {
    const admin = user as AdminUser;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Admin Profile
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dashboard admin user
              </p>
            </div>
          </div>
        </div>
        <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-700 max-w-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-3xl font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-4">
                {(admin.name || 'A').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{admin.name}</h2>
              <span className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {admin.role}
              </span>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">{admin.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              User Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View detailed information about this user
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            {/* Actions could go here */}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Card */}
        <Card className="lg:col-span-1 rounded-2xl shadow-sm border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-3xl font-bold text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 mb-4">
                 {(getName((user as any).name) || 'U').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getName((user as any).name)}</h2>
              <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getRoleBadge((user as any).role)}`}>
                {(user as any).role}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">{(user as any).email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">{(user as any).phone || 'No phone number'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  Joined {(user as any).createdAt ? format(new Date((user as any).createdAt), 'MMMM dd, yyyy') : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="rounded-xl border-gray-200 shadow-sm dark:border-gray-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Award className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loyalty Points</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{(user as any).loyaltyPoints ?? 0}</p>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border-gray-200 shadow-sm dark:border-gray-700 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Wallet className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Balance</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {Number((user as any).wallet?.balance ?? 0).toFixed(2)} <span className="text-xs font-normal text-gray-500">SAR</span>
                        </p>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border-gray-200 shadow-sm dark:border-gray-700 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{(user as any).stats?.totalRequests ?? 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="rounded-2xl border-gray-200 shadow-sm dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Bookings</CardTitle>
                    <CardDescription>Latest service requests made by this user</CardDescription>
                </CardHeader>
                <CardContent>
                    {(user as any).recentRequests && (user as any).recentRequests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Service</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-tr-lg">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(user as any).recentRequests.map((req: any) => (
                                        <tr key={req.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{req.service}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                {format(new Date(req.date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium 
                                                    ${req.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                                                      req.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                                                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                {Number(req.price).toFixed(2)} SAR
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No booking history found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};
