import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Wrench, RefreshCw, LayoutGrid, List, ChevronRight, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { serviceService } from '../../services/service.service';
import { serviceCategoryService } from '../../services/serviceCategory.service';
import type { Service, PaginatedResponse, MultilingualText } from '../../types';
import { useTranslation } from 'react-i18next';

type ViewMode = 'cards' | 'table';

/** Resolve upload URLs to the API origin so images load from the backend. */
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('blob:')) return url;
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = backendUrl.replace(/\/$/, '').replace(/\/api$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return baseUrl + cleanUrl;
};

export const ServicesPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const getPricingLabel = (s: Service) => {
    const type = s.pricing_type ?? 'FIXED';
    if (type === 'CUSTOMER_DEFINED') return t('common.customerDefined');
    if (type === 'PER_UNIT' && s.unit_label) return t('common.perUnit', { price: Number(s.base_price ?? 0).toFixed(0), unit: s.unit_label });
    if (type === 'BY_OPTION') return t('common.byOption');
    if (s.is_negotiable ?? s.isNegotiable) return t('common.negotiation');
    const price = s.base_price;
    return price != null ? `${Number(price).toFixed(0)} ${t('common.currency', { defaultValue: 'SAR' })}` : '—';
  };
  const [categoryFilter, setCategoryFilter] = useState<number | string | ''>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [emergencyFilter, setEmergencyFilter] = useState<boolean | 'all'>('all');

  const queryClient = useQueryClient();
  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => serviceCategoryService.list(),
  });
  const categories = categoriesData?.data ?? [];

  const { data, isLoading, error } = useQuery<PaginatedResponse<Service>>({
    queryKey: ['services', categoryFilter, activeFilter, emergencyFilter],
    queryFn: () =>
      serviceService.getAllServices({
        categoryId: categoryFilter === '' ? undefined : categoryFilter,
        isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
        is_emergency: emergencyFilter === 'all' ? undefined : emergencyFilter === true,
      }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? serviceService.activateService(id) : serviceService.deactivateService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const getName = (name: MultilingualText | string) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  const servicesRaw = data?.data ?? [];
  const services = searchTerm
    ? servicesRaw.filter((s: Service) => getName(s.name).toLowerCase().includes(searchTerm.toLowerCase()))
    : servicesRaw;
  const total = data?.total ?? servicesRaw.length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('common.services')}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t('common.servicesDesc')}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 focus:ring-2 focus:ring-teal-500">
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Button size="sm" className="rounded-xl bg-teal-600 shadow-lg gap-2 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500">
            {t('common.addService')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.totalServices')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
              <Wrench className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.fixedPrice')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {servicesRaw.filter((s: Service) => s.pricing_type === 'FIXED' || s.pricing_type === 'PER_UNIT').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <span className="text-lg font-bold">$</span>
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.negotiableOther')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {servicesRaw.filter((s: Service) => s.pricing_type !== 'FIXED' && s.pricing_type !== 'PER_UNIT').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-6 rounded-2xl border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <CardContent className="pt-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder={t('common.searchServices')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-gray-300 pl-10 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === '' ? '' : e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('common.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name_ar}</option>
              ))}
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('common.filterAllStatus')}</option>
              <option value="active">{t('common.filterActiveOnly')}</option>
              <option value="inactive">{t('common.filterInactiveOnly')}</option>
            </select>
            <select
              value={emergencyFilter === 'all' ? 'all' : emergencyFilter ? 'yes' : 'no'}
              onChange={(e) => setEmergencyFilter(e.target.value === 'all' ? 'all' : e.target.value === 'yes')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('common.filterAllServices')}</option>
              <option value="yes">{t('common.filterEmergencyOnly')}</option>
              <option value="no">{t('common.filterNoEmergency')}</option>
            </select>
            {/* View toggle: Cards | Table */}
            <div className="flex rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-teal-500 text-white dark:bg-teal-600'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                {t('common.cards')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-teal-500 text-white dark:bg-teal-600'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
                {t('common.list')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Wrench className="h-5 w-5 text-teal-500" />
            {t('common.allServices')}
          </CardTitle>
          <CardDescription>
            {data ? (searchTerm ? t('common.servicesDesc') : t('common.servicesDesc')) : t('common.servicesDesc')}
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
              <p>Error loading services. Please try again.</p>
            </div>
          )}

          {services.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Wrench className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{t('common.noRequests')}</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                {t('common.tryAdjusting')}
              </p>
            </div>
          )}

          {viewMode === 'cards' && services.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service: Service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-600"
                >
                  <div className="relative h-40 w-full shrink-0 bg-gradient-to-br from-teal-500/10 to-teal-600/5">
                    {service.icon_url ? (
                      <img
                        src={getImageUrl(service.icon_url)}
                        alt={getName(service.name)}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Wrench className="h-14 w-14 text-teal-500/50 dark:text-teal-400/40" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow dark:bg-gray-800/90 dark:text-gray-200">
                      {getPricingLabel(service)}
                    </div>
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          (service.is_active ?? service.isActive) !== false
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {(service.is_active ?? service.isActive) !== false ? <CheckCircle2 className="h-3 w-3" /> : null}
                        {(service.is_active ?? service.isActive) !== false ? t('common.active') : t('common.inactive')}
                      </span>
                      {(service as Service & { is_emergency?: boolean }).is_emergency && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          <AlertCircle className="h-3 w-3" />
                          {t('common.emergency')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {service.pricing_type ?? 'FIXED'}
                    </p>
                    <h3 className="mt-1 font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                      {getName(service.name)}
                    </h3>
                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{t('common.viewDetails')}</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {viewMode === 'table' && services.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.id')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.service')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.category')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.emergency')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.gpsRange')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.pricing')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {services.map((service: Service) => (
                    <tr key={service.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{service.id}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getName(service.name)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{service.category?.name_ar ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const active = (service.is_active ?? service.isActive) === false;
                            toggleActiveMutation.mutate({ id: String(service.id), active });
                          }}
                          disabled={toggleActiveMutation.isPending}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            (service.is_active ?? service.isActive) !== false
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {(service.is_active ?? service.isActive) !== false ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {(service.is_active ?? service.isActive) !== false ? t('common.active') : t('common.inactive')}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {(service as Service & { is_emergency?: boolean }).is_emergency ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3" /> {t('common.yes')}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        {service.gps_radius_km != null ? (
                          <><MapPin className="h-3.5 w-3.5" /> {service.gps_radius_km} {t('common.km')}</>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getPricingLabel(service)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          to={`/services/${service.id}`}
                          className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                          {t('common.viewEdit')}
                        </Link>
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
