import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import { Users, Building2, Calendar, DollarSign, TrendingUp, PieChart, Wallet, FileText } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#f97316', '#10b981', '#3b82f6', '#eab308'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f97316'];

export const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? '—',
      sub: 'All platform users',
      icon: Users,
      border: 'border-slate-200 dark:border-slate-700',
      bg: 'bg-slate-50 dark:bg-slate-900/30',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
    },
    {
      label: 'Active Providers',
      value: stats?.activeProviders ?? '—',
      sub: 'Verified providers',
      icon: Building2,
      border: 'border-emerald-200 dark:border-emerald-800',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800/50',
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings ?? '—',
      sub: 'All time bookings',
      icon: Calendar,
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-800/50',
    },
    {
      label: 'Revenue',
      value: isLoading ? '—' : stats != null ? `${Number(stats.platformRevenue).toFixed(2)} ر.س` : '—',
      sub: 'Platform revenue',
      icon: DollarSign,
      border: 'border-amber-200 dark:border-amber-800',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      iconBg: 'bg-amber-100 dark:bg-amber-800/50',
    },
    {
      label: 'Wallets',
      value: stats?.totalWallets ?? '—',
      sub: `Balance: ${stats != null ? Number(stats.totalWalletBalance ?? 0).toFixed(0) : '0'} ر.س`,
      icon: Wallet,
      border: 'border-violet-200 dark:border-violet-800',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      iconBg: 'bg-violet-100 dark:bg-violet-800/50',
      href: '/wallets',
    },
    {
      label: 'Reports',
      value: stats?.totalReports ?? '—',
      sub: 'Saved reports',
      icon: FileText,
      border: 'border-rose-200 dark:border-rose-800',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      iconBg: 'bg-rose-100 dark:bg-rose-800/50',
      href: '/reports',
    },
  ];

  const barData = stats
    ? [
        { name: 'Users', value: stats.totalUsers, fill: CHART_COLORS[0] },
        { name: 'Providers', value: stats.activeProviders, fill: CHART_COLORS[1] },
        { name: 'Bookings', value: stats.totalBookings, fill: CHART_COLORS[2] },
        { name: 'Revenue', value: Math.round(stats.platformRevenue), fill: CHART_COLORS[3] },
      ]
    : [];

  const pieData = stats
    ? [
        { name: 'Users', value: stats.totalUsers, fill: PIE_COLORS[0] },
        { name: 'Providers', value: stats.activeProviders, fill: PIE_COLORS[1] },
        { name: 'Bookings', value: stats.totalBookings, fill: PIE_COLORS[2] },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Dashboard Overview
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Monitor users, providers, bookings, and platform revenue at a glance.
        </p>
      </div>

      {/* Animated Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, i) => {
          const content = (
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${card.iconBg}`}
                >
                  <card.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white sm:text-3xl">
                  {card.value}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{card.sub}</p>
            </div>
          );
          const className = `
            dashboard-stat-card animate-card-enter overflow-hidden rounded-2xl border shadow-sm
            ${card.border} ${card.bg}
            ${i === 0 ? '' : i === 1 ? 'animate-card-enter-delay-1' : i === 2 ? 'animate-card-enter-delay-2' : i === 3 ? 'animate-card-enter-delay-3' : i === 4 ? 'animate-card-enter-delay-4' : 'animate-card-enter-delay-4'}
          `;
          return (card as { href?: string }).href ? (
            <Link key={card.label} to={(card as { href: string }).href} className={`block transition hover:opacity-90 ${className}`}>
              {content}
            </Link>
          ) : (
            <div key={card.label} className={className}>
              {content}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="animate-chart-enter overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Metrics Overview
            </h2>
          </div>
          {isLoading || barData.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isLoading ? 'Loading…' : 'No data yet'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                  }}
                  formatter={(value: number) => [value, '']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="animate-chart-enter overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribution
            </h2>
          </div>
          {isLoading || pieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isLoading ? 'Loading…' : 'No data yet'}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                  }}
                  formatter={(value: number, name: string) => [value, name]}
                />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Welcome Card */}
      <div className="animate-chart-enter mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Welcome to Bayt Car Admin
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Use the sidebar to manage users, providers, services, bookings, commissions, wallets, and reports.
            Wallets are for clients and providers; admin can view all and generate reports.
          </p>
        </div>
      </div>
    </div>
  );
};
