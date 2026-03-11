import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import { 
  Users, Building2, Calendar, DollarSign, TrendingUp, 
  Wallet, FileText, Plus, Activity, Bell
} from 'lucide-react';
import { systemSettingsService } from '../../services/systemSettings.service';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Button } from '../../components/ui/button';
import { useTranslation } from 'react-i18next';

const CHART_COLORS = ['#f97316', '#10b981', '#3b82f6', '#eab308'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f97316'];

export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: systemSettingsService.getSettings,
  });

  const getGreeting = () => {
    const welcomeMsg = i18n.language === 'ar' 
      ? settings?.welcome_message_ar 
      : settings?.welcome_message_en;
    
    if (welcomeMsg) return welcomeMsg;

    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isLoading = statsLoading;

  const statCards = [
    {
      label: t('common.totalUsers'),
      value: stats?.totalUsers ?? '—',
      sub: t('common.platformOverview'),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      trend: '+12%',
      trendUp: true
    },
    {
      label: t('common.activeProviders'),
      value: stats?.activeProviders ?? '—',
      sub: t('common.management'),
      icon: Building2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      trend: '+5%',
      trendUp: true
    },
    {
      label: t('common.totalBookings'),
      value: stats?.totalBookings ?? '—',
      sub: t('common.overview'),
      icon: Calendar,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      trend: '85',
      trendUp: true
    },
    {
      label: t('common.revenue'),
      value: isLoading ? '—' : stats != null ? `${Number(stats.platformRevenue).toFixed(2)}` : '—',
      sub: 'SAR',
      icon: DollarSign,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      trend: '+18%',
      trendUp: true
    },
  ];

  const quickActions = [
    { name: t('common.addProvider'), href: '/providers', icon: Plus, color: 'bg-emerald-500' },
    { name: t('common.newInvoice'), href: '/invoices', icon: FileText, color: 'bg-blue-500' },
    { name: t('common.walletAdjustment'), href: '/wallets', icon: Wallet, color: 'bg-violet-500' },
    { name: t('common.systemSettings'), href: '/settings', icon: Activity, color: 'bg-gray-500' },
  ];

  const barData = stats
    ? [
        { name: t('common.users'), value: stats.totalUsers, fill: CHART_COLORS[0] },
        { name: t('common.providers'), value: stats.activeProviders, fill: CHART_COLORS[1] },
        { name: t('common.bookings'), value: stats.totalBookings, fill: CHART_COLORS[2] },
        { name: t('common.revenue'), value: Math.round(stats.platformRevenue), fill: CHART_COLORS[3] },
      ]
    : [];

  const pieData = stats
    ? [
        { name: t('common.users'), value: stats.totalUsers, fill: PIE_COLORS[0] },
        { name: t('common.providers'), value: stats.activeProviders, fill: PIE_COLORS[1] },
        { name: t('common.bookings'), value: stats.totalBookings, fill: PIE_COLORS[2] },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {getGreeting()}, Admin
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {t('common.platformOverview')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
            {t('common.reports')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {card.value}
                </h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`flex items-center text-xs font-medium ${card.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                <TrendingUp className="mr-1 h-3 w-3" />
                {card.trend}
              </span>
              <span className="text-xs text-gray-400">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="col-span-2 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('common.platformOverview')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.overview')}</p>
            </div>
          </div>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={barData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Distribution */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">{t('common.quickActions')}</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Distribution Mini Chart */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">{t('common.distribution')}</h3>
            <div className="h-[200px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
