import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Wrench, Tag, Coins, FileText, CheckCircle2, Hash, Calendar, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { serviceService } from '../../services/service.service';
import type { ServiceDetail } from '../../types';

const getName = (name: ServiceDetail['name']) => {
  if (typeof name === 'string') return name;
  return (name as { en?: string; ar?: string })?.en || (name as { en?: string; ar?: string })?.ar || '—';
};

const getDesc = (desc: ServiceDetail['description']) => {
  if (desc == null) return '';
  if (typeof desc === 'string') return desc;
  return (desc as { en?: string; ar?: string })?.en || (desc as { en?: string; ar?: string })?.ar || '';
};

export const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceService.getServiceById(id!),
    enabled: !!id,
  });

  const price = service?.base_price ?? service?.price;
  const isNegotiable = service?.is_negotiable ?? service?.isNegotiable;

  if (isLoading) {
    return (
      <div className="animate-fade-in flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-16">
        <p className="text-gray-600 dark:text-gray-400">Service not found.</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/services')}>
          Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back + Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2 text-gray-600 dark:text-gray-400"
          onClick={() => navigate('/services')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Service Details
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Full details and options for this service
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main: Image + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card with image */}
          <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-56 w-full shrink-0 bg-gradient-to-br from-teal-500/20 to-teal-600/10 sm:h-64 sm:w-72">
                {service.icon_url ? (
                  <img
                    src={service.icon_url}
                    alt={getName(service.name)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Wrench className="h-24 w-24 text-teal-500/60 dark:text-teal-400/50" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center p-6">
                <div className="flex items-center gap-2">
                  {service.category && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                      <Tag className="h-3.5 w-3.5" />
                      {typeof service.category.name === 'string'
                        ? service.category.name
                        : (service.category.name as { en?: string; ar?: string })?.en ||
                          (service.category.name as { en?: string; ar?: string })?.ar ||
                          '—'}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  {getName(service.name)}
                </h2>
                {getDesc(service.description) && (
                  <p className="mt-2 line-clamp-3 text-gray-600 dark:text-gray-400">
                    {getDesc(service.description)}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 dark:bg-gray-700/60">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isNegotiable
                        ? 'Negotiable'
                        : price != null
                          ? `${Number(price).toFixed(2)} ر.س`
                          : '—'}
                    </span>
                  </div>
                  {isNegotiable && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      Price negotiable
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          {getDesc(service.description) && (
            <Card className="rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 text-teal-500" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {getDesc(service.description)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Service info + Attributes */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Info className="h-5 w-5 text-teal-500" />
                Service Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Hash className="h-4 w-4 text-teal-500 shrink-0" />
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">ID</p>
                  <p className="text-gray-900 dark:text-white">{String(service.id)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-gray-900 dark:text-white">
                    {service.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">Inactive</span>
                    )}
                  </p>
                </div>
              </div>
              {service.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-teal-500 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(service.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {service.updatedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-teal-500 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">Updated</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(service.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <CheckCircle2 className="h-5 w-5 text-teal-500" />
                Options & Attributes
              </CardTitle>
              <CardDescription>
                Choices available when booking this service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {service.attributes && service.attributes.length > 0 ? (
                <ul className="space-y-4">
                  {service.attributes.map((attr) => (
                    <li key={attr.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                      <p className="font-medium text-gray-900 dark:text-white">{attr.label}</p>
                      {attr.options && attr.options.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {attr.options.map((opt) => (
                            <li key={opt.id} className="flex items-center justify-between">
                              <span>{opt.label}</span>
                              {opt.price_adjustment != null && Number(opt.price_adjustment) !== 0 && (
                                <span className="text-amber-600 dark:text-amber-400">
                                  +{Number(opt.price_adjustment).toFixed(2)} ر.س
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No attributes defined for this service.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
