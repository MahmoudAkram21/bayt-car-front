import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowUpRight,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Gift,
  Percent,
  Plus,
  Receipt,
  Sparkles,
  Tag,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Wrench,
  XCircle,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import { systemSettingsService } from '../../services/systemSettings.service';
import { promoService } from '../../services/promo.service';
import { Button } from '../../components/ui/button';
import { useRolePermissions } from '../../hooks/useRolePermissions';

const COLORS = ['#f97316', '#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b'];

const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

const formatPercent = (value: number) => `${Math.round(value)}%`;

export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { can } = useRolePermissions();
  const canReadReports = can('REPORTS', 'READ');
  const canReadProviders = can('PROVIDERS', 'READ');
  const canReadUsers = can('USERS', 'READ');
  const canReadServiceRequests = can('SERVICE_REQUESTS', 'READ');
  const canReadWallets = can('WALLETS', 'READ');
  const canReadSettings = can('SETTINGS', 'READ');
  const canReadPromos = can('PROMOS', 'READ');
  const canReadCommissions = can('COMMISSIONS', 'READ');
  const canReadTax = can('TAX', 'READ');
  const canReadInvoices = can('INVOICES', 'READ');
  const canReadLoyalty = can('LOYALTY', 'READ');
  const canReadSupportTickets = can('SUPPORT_TICKETS', 'READ');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: systemSettingsService.getSettings,
    enabled: canReadSettings,
  });

  const { data: providerPromosData } = useQuery({
    queryKey: ['promo-provider-promos'],
    queryFn: () => promoService.listProviderPromos(),
    enabled: canReadPromos,
  });
  const providerPromos = providerPromosData?.data ?? [];

  const text = (ar: string, en: string) => (isArabic ? ar : en);

  const getGreeting = () => {
    const welcomeMsg = isArabic ? settings?.welcome_message_ar : settings?.welcome_message_en;
    if (welcomeMsg) return welcomeMsg;

    const hour = new Date().getHours();
    if (hour < 12) return text('صباح الخير', 'Good Morning');
    if (hour < 18) return text('مساء الخير', 'Good Afternoon');
    return text('مساء الخير', 'Good Evening');
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (value: number) => new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US').format(value);

  const todayLabel = new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const revenue = stats?.totalInvoiceRevenue || stats?.platformRevenue || 0;
  const totalRequests = stats?.totalServiceRequests || stats?.totalBookings || 0;
  const totalCancelled = stats?.totalCancelled ?? stats?.servicesIndicators?.cancelledRequests ?? 0;
  const completedRequests = stats?.servicesIndicators?.completedRequests ?? stats?.completedAfterPayment ?? 0;
  const openRequests = stats?.servicesIndicators?.openRequests ?? stats?.openAfterPayment ?? 0;
  const totalPaidRequests = stats?.totalPaidRequests ?? 0;
  const completedAfterPayment = stats?.completedAfterPayment ?? 0;
  const openAfterPayment = stats?.openAfterPayment ?? 0;
  const inProgressRequests = Math.max(totalPaidRequests - openAfterPayment - completedAfterPayment, 0);
  const providerTotal = stats?.totalProviders ?? stats?.activeProviders ?? 0;
  const activeUsers = stats?.activeUsers ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;

  const overviewCards = [
    {
      label: t('dashboard.totalRevenue'),
      value: isLoading ? '—' : formatCurrency(revenue),
      sub: text('إجمالي قيمة التحصيل', 'Total billed value'),
      accent: formatPercent(percent(stats?.totalPlatformCommission ?? 0, revenue || 1)),
      accentLabel: text('نسبة العمولة', 'Commission rate'),
      icon: DollarSign,
      shell: 'from-orange-500/15 via-orange-500/5 to-transparent',
      iconShell: 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300',
      chip: 'bg-orange-500/12 text-orange-700 dark:text-orange-200',
      visible: canReadWallets,
    },
    {
      label: t('common.totalBookings'),
      value: isLoading ? '—' : formatNumber(totalRequests),
      sub: text('كل الطلبات المسجلة', 'All recorded requests'),
      accent: formatPercent(percent(completedRequests, totalRequests || 1)),
      accentLabel: text('مكتمل', 'Completed'),
      icon: Calendar,
      shell: 'from-sky-500/15 via-sky-500/5 to-transparent',
      iconShell: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
      chip: 'bg-sky-500/12 text-sky-700 dark:text-sky-200',
      visible: canReadServiceRequests,
    },
    {
      label: t('common.activeProviders'),
      value: isLoading ? '—' : formatNumber(stats?.activeProviders ?? 0),
      sub: text('المتاحون للخدمة الآن', 'Currently available providers'),
      accent: formatPercent(percent(stats?.activeProviders ?? 0, providerTotal || 1)),
      accentLabel: text('جاهزية', 'Activation'),
      icon: Building2,
      shell: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      iconShell: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
      chip: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-200',
      visible: canReadProviders,
    },
    {
      label: t('common.totalUsers'),
      value: isLoading ? '—' : formatNumber(totalUsers),
      sub: text('عملاء ومزودون وإدارة', 'Customers, providers, and admins'),
      accent: formatPercent(percent(activeUsers, totalUsers || 1)),
      accentLabel: text('نشط الآن', 'Active now'),
      icon: Users,
      shell: 'from-violet-500/15 via-violet-500/5 to-transparent',
      iconShell: 'bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300',
      chip: 'bg-violet-500/12 text-violet-700 dark:text-violet-200',
      visible: canReadUsers,
    },
  ].filter((card) => card.visible);

  const insights = [
    canReadServiceRequests && {
      title: text('معدل إتمام الدفع', 'Payment completion'),
      value: isLoading ? '—' : formatPercent(percent(completedAfterPayment, totalPaidRequests || 1)),
      note: text(
        `تم إنهاء ${formatNumber(completedAfterPayment)} من أصل ${formatNumber(totalPaidRequests)} طلب مدفوع.`,
        `${formatNumber(completedAfterPayment)} of ${formatNumber(totalPaidRequests)} paid requests are completed.`
      ),
      icon: CheckCircle2,
      iconShell: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
    },
    canReadServiceRequests && {
      title: text('معدل الإلغاء', 'Cancellation rate'),
      value: isLoading ? '—' : formatPercent(percent(totalCancelled, totalRequests || 1)),
      note: text(
        `${formatNumber(totalCancelled)} حالة إلغاء من إجمالي ${formatNumber(totalRequests)} طلب.`,
        `${formatNumber(totalCancelled)} cancellations out of ${formatNumber(totalRequests)} total requests.`
      ),
      icon: XCircle,
      iconShell: 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
    },
    canReadUsers && {
      title: text('نشاط المستخدمين', 'Active user pulse'),
      value: isLoading ? '—' : formatPercent(percent(activeUsers, totalUsers || 1)),
      note: text(
        `${formatNumber(activeUsers)} مستخدم نشط من أصل ${formatNumber(totalUsers)}.`,
        `${formatNumber(activeUsers)} active users from ${formatNumber(totalUsers)} total users.`
      ),
      icon: Sparkles,
      iconShell: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
    },
  ].filter(Boolean) as Array<{ title: string; value: string; note: string; icon: typeof CheckCircle2; iconShell: string }>;

  const healthBars = [
    { label: t('dashboard.completed'), value: completedRequests, color: 'bg-emerald-500' },
    { label: t('dashboard.open'), value: openRequests, color: 'bg-amber-500' },
    { label: t('dashboard.cancelled'), value: totalCancelled, color: 'bg-rose-500' },
  ];

  const requestJourneyData = [
    { name: t('dashboard.completed'), value: completedRequests },
    { name: t('dashboard.open'), value: openRequests },
    { name: t('dashboard.cancelled'), value: totalCancelled },
    { name: t('dashboard.inProgress'), value: inProgressRequests },
  ].filter((item) => item.value > 0);

  const revenueMixData = [
    { name: t('dashboard.totalRevenue'), value: revenue, fill: COLORS[0] },
    { name: t('dashboard.platformCommission'), value: stats?.totalPlatformCommission ?? 0, fill: COLORS[1] },
    { name: t('dashboard.taxCollected'), value: stats?.totalTaxCollected ?? 0, fill: COLORS[2] },
    { name: t('reports.summary.totalDiscounts'), value: stats?.totalDiscounts ?? 0, fill: COLORS[3] },
    { name: t('reports.summary.totalCashback'), value: stats?.totalCashback ?? 0, fill: COLORS[4] },
  ].filter((item) => item.value > 0);

  const regionData = (stats?.topRegions ?? []).slice(0, 5).map((region, index) => ({
    name: region.region,
    value: region.count,
    fill: COLORS[index % COLORS.length],
  }));

  const commissionData = (stats?.commissionByService ?? []).slice(0, 5);
  const providerData = (stats?.providersByService ?? []).slice(0, 5);

  const quickActions = [
    { name: t('common.addProvider'), href: '/providers', icon: Plus, iconShell: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300', visible: canReadProviders },
    { name: t('common.newInvoice'), href: '/invoices', icon: FileText, iconShell: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300', visible: canReadInvoices },
    { name: t('common.walletAdjustment'), href: '/wallets', icon: Wallet, iconShell: 'bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300', visible: canReadWallets },
    { name: t('common.systemSettings'), href: '/settings', icon: Wrench, iconShell: 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300', visible: canReadSettings },
  ].filter((action) => action.visible);

  const compactStats = [
    { label: t('dashboard.platformCommission'), value: isLoading ? '—' : formatCurrency(stats?.totalPlatformCommission ?? 0), hint: text('حصة المنصة من العائد', 'Platform share'), icon: Percent, iconShell: 'bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300', visible: canReadCommissions },
    { label: t('dashboard.taxCollected'), value: isLoading ? '—' : formatCurrency(stats?.totalTaxCollected ?? 0), hint: text('إجمالي الضرائب المحصلة', 'Collected tax total'), icon: Receipt, iconShell: 'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300', visible: canReadTax },
    { label: t('common.invoices'), value: isLoading ? '—' : formatNumber(stats?.totalTransactions ?? 0), hint: text('عدد العمليات والفواتير', 'Transaction volume'), icon: CreditCard, iconShell: 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300', visible: canReadInvoices },
    { label: t('dashboard.loyaltyPoints'), value: isLoading ? '—' : formatNumber(stats?.loyaltyPointsBalance ?? 0), hint: text('إجمالي نقاط الولاء', 'Loyalty balance'), icon: Gift, iconShell: 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300', visible: canReadLoyalty },
  ].filter((item) => item.visible);

  const tooltipStyle = {
    borderRadius: '18px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(15,23,42,0.92)',
    color: '#fff',
    boxShadow: '0 16px 45px -24px rgba(15,23,42,0.6)',
  };

  return (
    <div className="animate-fade-in space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/50 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,247,237,0.94))] p-6 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(135deg,rgba(17,24,39,0.92),rgba(10,14,22,0.94))] sm:p-8">
        <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              {todayLabel}
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">{getGreeting()}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
              {text(
                'واجهة أوضح لاتخاذ القرار بسرعة: أهم الأرقام أولًا، حالة التشغيل في المنتصف، والتفاصيل الداعمة في بطاقات أسهل للقراءة.',
                'A cleaner decision layer: key numbers first, operational health in the middle, and supporting details in lighter, easier-to-scan cards.'
              )}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {canReadReports && (
                <Link to="/reports">
                  <Button className="rounded-full bg-gray-950 px-5 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100">
                    {t('common.reports')}
                  </Button>
                </Link>
              )}
              {canReadProviders && (
                <Link to="/providers">
                  <Button variant="outline" className="rounded-full border-white/70 bg-white/70 px-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                    <ArrowUpRight className="me-2 h-4 w-4" />
                    {t('common.addProvider')}
                  </Button>
                </Link>
              )}
              {canReadSupportTickets && (
                <Button variant="outline" size="icon" className="rounded-full border-white/70 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                  <Bell className="h-4.5 w-4.5" />
                </Button>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {overviewCards.map((card, index) => (
                <div
                  key={card.label}
                  className={`dashboard-stat-card animate-card-enter rounded-[30px] border border-gray-200/60 bg-gradient-to-br ${card.shell} bg-white/90 p-5 shadow-[0_16px_50px_-28px_rgba(15,23,42,0.28)] backdrop-blur-sm dark:border-white/8 dark:bg-gray-950/65 xl:min-h-[218px]`}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="max-w-[14rem] text-sm font-semibold leading-6 text-gray-500 dark:text-gray-400">{card.label}</p>
                      <p className="mt-4 text-4xl font-bold tracking-tight text-gray-950 dark:text-white">{card.value}</p>
                    </div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${card.iconShell}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-auto pt-6">
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{card.sub}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${card.chip}`}>
                        <TrendingUp className="h-3.5 w-3.5" />
                        {card.accent}
                      </div>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{card.accentLabel}</span>
                    </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {insights.length > 0 && (
          <div className="animate-scale-in rounded-[28px] border border-white/60 bg-white/72 p-5 shadow-[0_28px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur-md dark:border-white/10 dark:bg-white/6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-400">{text('الـ Insights', 'Insights')}</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-950 dark:text-white">{text('ملخص تنفيذي سريع', 'Executive snapshot')}</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-950 text-white dark:bg-white dark:text-gray-950">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {insights.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/60 bg-white/80 p-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/5 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">{item.value}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.iconShell}`}>
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">{item.note}</p>
                </div>
              ))}
            </div>

            {canReadServiceRequests && (
            <div className="mt-5 rounded-[24px] border border-gray-200/70 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{text('صحة التشغيل', 'Operational health')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{text('كيف تتحرك الطلبات على المنصة', 'How requests are currently moving')}</p>
                </div>
                <div className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                  {formatPercent(percent(completedRequests + inProgressRequests, totalRequests || 1))}
                </div>
              </div>
              <div className="space-y-4">
                {healthBars.map((item) => {
                  const valuePercent = percent(item.value, totalRequests || 1);
                  return (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                        <span className="text-gray-500 dark:text-gray-400">{formatNumber(item.value)} • {formatPercent(valuePercent)}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-200/80 dark:bg-white/10">
                        <div className={`h-full rounded-full transition-all duration-700 ${item.color}`} style={{ width: `${Math.max(valuePercent, 4)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
          )}
        </div>
      </section>

      {(canReadServiceRequests || canReadWallets || canReadCommissions || canReadTax || canReadPromos || canReadLoyalty) && (
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        {canReadServiceRequests && (
        <div className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{text('حركة التشغيل', 'Operations flow')}</p>
              <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{text('رحلة الطلبات على المنصة', 'Request journey')}</h3>
            </div>
            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/8 dark:text-gray-300">
              {text('مقارنة مباشرة', 'Direct comparison')}
            </div>
          </div>
          <div className="h-[320px] animate-chart-enter" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestJourneyData}>
                <defs>
                  <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#f97316', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fill="url(#requestsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        <div className="space-y-6">
          {(canReadWallets || canReadCommissions || canReadTax || canReadPromos || canReadLoyalty) && (
          <div className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{text('التوزيع المالي', 'Revenue mix')}</p>
                <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{text('تكوين العائد', 'Revenue composition')}</h3>
              </div>
              <DollarSign className="h-5 w-5 text-orange-500" />
            </div>
            <div className="h-[240px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={revenueMixData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} paddingAngle={4}>
                    {revenueMixData.map((item) => (
                      <Cell key={item.name} fill={item.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>
          )}

          {quickActions.length > 0 && (
          <div className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{text('إجراءات سريعة', 'Quick actions')}</p>
                <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{t('common.quickActions')}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="group rounded-[22px] border border-gray-200/70 bg-gray-50/80 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:bg-white hover:shadow-lg dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.iconShell}`}>
                    <action.icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{action.name}</p>
                </Link>
              ))}
            </div>
          </div>
          )}
        </div>
      </section>
      )}

      {canReadPromos && (
      <section className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{t('common.promo')}</p>
            <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{t('dashboard.providerPromoCodes')}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('dashboard.providerPromoCodesDesc')}</p>
          </div>
          <Link to="/promo?providerPromosOnly=true">
            <Button variant="outline" size="sm" className="rounded-full gap-2">
              <Tag className="h-4 w-4" />
              {t('common.viewAllProviderPromos')}
            </Button>
          </Link>
        </div>
        {providerPromos.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">{t('dashboard.providerPromoNoOffers')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 pr-4 font-semibold text-gray-500 dark:text-gray-400">{t('common.promoCode')}</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-500 dark:text-gray-400">{t('common.providerName')}</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-500 dark:text-gray-400">{t('common.promoValue')}</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-500 dark:text-gray-400">{t('common.servicesApplied')}</th>
                  <th className="pb-3 pr-4 font-semibold text-gray-500 dark:text-gray-400">{t('common.promoUsage')}</th>
                  <th className="pb-3 font-semibold text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {providerPromos.slice(0, 10).map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-3 pr-4">
                      <span className="inline-flex rounded-md bg-rose-100 px-2 py-0.5 font-mono text-sm font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                        {o.code}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{o.provider?.user?.name ?? '—'}</td>
                    <td className="py-3 pr-4">
                      {o.type === 'PERCENTAGE' ? `${Number(o.value)}%` : `${Number(o.value)} ${t('dashboard.sar')}`}
                    </td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                      {o.offer_services && o.offer_services.length > 0
                        ? o.offer_services.map((os: { service?: { name?: string }; service_id?: string }) => os.service?.name ?? os.service_id ?? '').filter(Boolean).join(', ')
                        : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-700">
                        {o.usage_count}{o.usage_limit != null ? ` / ${o.usage_limit}` : ''}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${o.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${o.is_active ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                        {o.is_active ? t('common.active') : t('common.disabled')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {(canReadCommissions || canReadTax || canReadInvoices || canReadLoyalty) && (
      <section className="grid gap-6 lg:grid-cols-4">
        {compactStats.map((item) => (
          <div key={item.label} className="rounded-[22px] border border-gray-200/70 bg-white/80 p-4 shadow-[0_12px_36px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/8 dark:bg-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">{item.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">{item.value}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.hint}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconShell}`}>
                <item.icon className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
        ))}
      </section>
      )}

      {(canReadReports || canReadWallets || canReadServiceRequests) && (
      <section className="grid gap-6 xl:grid-cols-3">
        {canReadReports && (
        <div className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{text('الانتشار الجغرافي', 'Regional demand')}</p>
              <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{text('أعلى المناطق نشاطًا', 'Top active regions')}</h3>
            </div>
            <div className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-200">
              {formatNumber(stats?.totalRegions ?? 0)} {text('منطقة', 'regions')}
            </div>
          </div>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="rgba(148,163,184,0.14)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={110} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(249,115,22,0.08)' }} />
                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                  {regionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        <div className="space-y-6">
          {canReadServiceRequests && (
          <div className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{text('خدمة العملاء', 'Support status')}</p>
                <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{text('حالة التذاكر والطلبات', 'Requests status')}</h3>
              </div>
              <Ticket className="h-5 w-5 text-sky-500" />
            </div>
            <div className="space-y-3">
              <div className="rounded-[20px] bg-gray-50/90 p-4 dark:bg-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.open')}</p>
                <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-300">{formatNumber(openAfterPayment)}</p>
              </div>
              <div className="rounded-[20px] bg-gray-50/90 p-4 dark:bg-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.inProgress')}</p>
                <p className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-300">{formatNumber(inProgressRequests)}</p>
              </div>
              <div className="rounded-[20px] bg-gray-50/90 p-4 dark:bg-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.completed')}</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-300">{formatNumber(completedAfterPayment)}</p>
              </div>
            </div>
          </div>
          )}

          {canReadWallets && (
          <div className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{text('الأرصدة', 'Wallet balances')}</p>
                <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{text('نظرة على المحافظ', 'Wallet snapshot')}</h3>
              </div>
              <Wallet className="h-5 w-5 text-violet-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{text('الرصيد المتاح', 'Available balance')}</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatCurrency(stats?.totalWalletBalance ?? 0)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-200/80 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${Math.max(percent(stats?.totalWalletBalance ?? 0, (stats?.totalWalletBalance ?? 0) + (stats?.totalFrozenBalance ?? 0) || 1), 10)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{text('الرصيد المجمّد', 'Frozen balance')}</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatCurrency(stats?.totalFrozenBalance ?? 0)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-200/80 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${Math.max(percent(stats?.totalFrozenBalance ?? 0, (stats?.totalWalletBalance ?? 0) + (stats?.totalFrozenBalance ?? 0) || 1), (stats?.totalFrozenBalance ?? 0) ? 10 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>
      )}

      {(canReadCommissions || canReadProviders) && (
      <section className="grid gap-6 xl:grid-cols-2">
        {canReadCommissions && (
        <div className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{text('الخدمات', 'Services')}</p>
              <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{text('العمولات حسب الخدمة', 'Commission by service')}</h3>
            </div>
            <Percent className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="space-y-4">
            {commissionData.length > 0 ? (
              commissionData.map((item, index) => {
                const percentageValue = percent(item.commission, commissionData.reduce((sum, current) => sum + current.commission, 0) || 1);
                return (
                  <div key={item.serviceName}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.serviceName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(percentageValue)}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(item.commission)}</p>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-200/80 dark:bg-white/10">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(percentageValue, 6)}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[22px] border border-dashed border-gray-300/80 p-5 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                {t('dashboard.noCommissionData')}
              </div>
            )}
          </div>
        </div>
        )}

        {canReadProviders && (
        <div className="rounded-[30px] border border-gray-200/70 bg-white/88 p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-gray-950/70">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">{text('القدرة التشغيلية', 'Capacity')}</p>
              <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">{text('المزودون حسب الخدمة', 'Providers by service')}</h3>
            </div>
            <UserCheck className="h-5 w-5 text-violet-500" />
          </div>
          <div className="space-y-4">
            {providerData.length > 0 ? (
              providerData.map((item, index) => {
                const percentageValue = percent(item.providerCount, providerData.reduce((sum, current) => sum + current.providerCount, 0) || 1);
                return (
                  <div key={item.serviceName} className="rounded-[22px] border border-gray-200/70 bg-gray-50/85 p-4 dark:border-white/8 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.serviceName}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{text('من إجمالي السعة المتاحة', 'Share of active service capacity')}</p>
                      </div>
                      <div className="text-end">
                        <p className="text-xl font-bold text-gray-950 dark:text-white">{formatNumber(item.providerCount)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(percentageValue)}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-200/80 dark:bg-white/10">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(percentageValue, 6)}%`, backgroundColor: COLORS[(index + 1) % COLORS.length] }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[22px] border border-dashed border-gray-300/80 p-5 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                {t('dashboard.noDataAvailable')}
              </div>
            )}
          </div>
        </div>
        )}
      </section>
      )}
    </div>
  );
};
