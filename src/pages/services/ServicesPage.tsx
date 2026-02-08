import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Wrench, RefreshCw, LayoutGrid, List, ChevronRight } from 'lucide-react';
import { serviceService } from '../../services/service.service';
import type { Service } from '../../types';

type ViewMode = 'cards' | 'table';

const getPricingLabel = (s: Service) => {
  const type = s.pricing_type ?? 'FIXED';
  if (type === 'CUSTOMER_DEFINED') return 'العميل يحدد السعر';
  if (type === 'PER_UNIT' && s.unit_label) return `${Number(s.base_price ?? 0).toFixed(0)} ر.س / ${s.unit_label}`;
  if (type === 'BY_OPTION') return 'حسب الخيار';
  if (s.is_negotiable ?? s.isNegotiable) return 'تفاوض';
  const price = s.base_price ?? (s as any).price;
  return price != null ? `${Number(price).toFixed(0)} ر.س` : '—';
};

export const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceService.getAllServices(),
  });

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  const servicesRaw = data?.data ?? [];
  const services = searchTerm
    ? servicesRaw.filter((s: Service) => getName(s.name).toLowerCase().includes(searchTerm.toLowerCase()))
    : servicesRaw;
  const total = (data as any)?.pagination?.total ?? servicesRaw.length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Services
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            View and manage all services. Switch between cards and table view.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 focus:ring-2 focus:ring-teal-500">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="rounded-xl bg-teal-600 shadow-lg gap-2 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500">
            Add Service
          </Button>
        </div>
      </div>

      {/* Stat card */}
      <div className="mb-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-600 dark:bg-gray-800/50">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Services</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 shadow-sm">
              <Wrench className="h-6 w-6 text-gray-600 dark:text-gray-400" />
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
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-gray-300 pl-10 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
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
                Cards
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
                Table
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Wrench className="h-5 w-5 text-teal-500" />
            All Services
          </CardTitle>
          <CardDescription>
            {data ? (searchTerm ? `${services.length} of ${total} services` : `${total} services found`) : 'View all services'}
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
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No services found</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters
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
                        src={service.icon_url}
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
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {service.pricing_type ?? 'FIXED'}
                    </p>
                    <h3 className="mt-1 font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                      {getName(service.name)}
                    </h3>
                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>View details</span>
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
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Service Name</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pricing</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {services.map((service: Service) => (
                    <tr key={service.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{service.id}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getName(service.name)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getPricingLabel(service)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          to={`/services/${service.id}`}
                          className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                          View
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
