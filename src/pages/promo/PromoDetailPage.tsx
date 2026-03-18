import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Tag,
  Ticket,
  CheckCircle2,
  XCircle,
  Wrench,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { promoService, type PromoOffer } from '../../services/promo.service';
import { format } from 'date-fns';

type OfferWithUsages = PromoOffer & {
  usages?: { id: string; discount_amount: number; used_at: string; service_request_id?: string }[];
};

const SCOPE_KEYS: Record<string, string> = {
  ALL: 'common.promoScopeAll',
  SERVICE: 'common.promoScopeSingle',
  SERVICES: 'common.promoScopeMultiple',
};

export const PromoDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: offer, isLoading, error } = useQuery({
    queryKey: ['promo-offer-detail', id],
    queryFn: () => promoService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <p className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{t('common.promoOfferNotFound')}</p>
        <Button variant="outline" className="mt-6 rounded-xl" onClick={() => navigate('/promo')}>
          {t('common.promoBackToOffersShort')}
        </Button>
      </div>
    );
  }

  const o = offer as OfferWithUsages;
  const usages = o.usages ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => navigate('/promo')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.promoBackToOffers')}
        </Button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 p-8 shadow-2xl dark:from-rose-700 dark:via-rose-800 dark:to-pink-800">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath fill='%23fff' fill-opacity='.15' d='M36 34v-2h-2v2h2zm0-4v-2h-2v2h2z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '60px 60px' }} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
              <Tag className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {o.code}
              </h1>
              <p className="mt-1 text-white/90">
                {o.type === 'PERCENTAGE' ? t('common.promoDiscountPercent', { value: Number(o.value) }) : t('common.promoDiscountFixed', { value: Number(o.value) })}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium backdrop-blur ${o.is_active ? 'bg-white/20 text-white' : 'bg-black/20 text-white/90'}`}>
                  {o.is_active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {o.is_active ? t('common.active') : t('common.disabled')}
                </span>
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                  {SCOPE_KEYS[o.scope] ? t(SCOPE_KEYS[o.scope]) : o.scope}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl bg-white/20 text-white hover:bg-white/30 backdrop-blur shrink-0"
            onClick={() => navigate('/promo', { state: { editId: o.id } })}
          >
            {t('common.promoEditOfferBtn')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main details */}
        <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Ticket className="h-5 w-5 text-rose-500" />
              {t('common.promoDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {o.provider && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('common.providerName')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{o.provider.user?.name ?? '—'}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('common.type')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{o.type === 'PERCENTAGE' ? t('common.promoTypePercentage') : t('common.promoTypeFixed')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('common.promoValue')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{o.type === 'PERCENTAGE' ? `${Number(o.value)}%` : `${Number(o.value)} ر.س`}</span>
            </div>
            {(o.min_order_amount != null && Number(o.min_order_amount) > 0) && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('common.promoMinOrderLabel')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{Number(o.min_order_amount)} ر.س</span>
              </div>
            )}
            {(o.max_discount != null && Number(o.max_discount) > 0) && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('common.promoMaxDiscountLabel')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{Number(o.max_discount)} ر.س</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('common.promoUsageLabel')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{o.usage_count} {o.usage_limit != null ? `/ ${o.usage_limit}` : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('common.promoValidFromLabel')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{o.valid_from ? format(new Date(o.valid_from), 'PPp') : '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('common.promoValidToLabel')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{o.valid_to ? format(new Date(o.valid_to), 'PPp') : t('common.promoValidOpen')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Scope / Services */}
        <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Wrench className="h-5 w-5 text-rose-500" />
              {t('common.promoScopeAndServices')}
            </CardTitle>
            <CardDescription>{SCOPE_KEYS[o.scope] ? t(SCOPE_KEYS[o.scope]) : o.scope}</CardDescription>
          </CardHeader>
          <CardContent>
            {o.scope === 'ALL' && (
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('common.promoScopeAllDesc')}</p>
            )}
            {o.scope === 'SERVICE' && o.entity_id && (
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('common.promoOneServiceDesc', { id: o.entity_id })}</p>
            )}
            {o.scope === 'SERVICES' && o.offer_services && o.offer_services.length > 0 && (
              <ul className="space-y-2">
                {o.offer_services.map((os) => (
                  <li key={os.service_id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    {os.service?.name ?? os.service_id}
                  </li>
                ))}
              </ul>
            )}
            {o.scope === 'SERVICES' && (!o.offer_services || o.offer_services.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.promoNoServicesSelected')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent usages */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <DollarSign className="h-5 w-5 text-rose-500" />
            {t('common.promoUsageHistory')}
          </CardTitle>
          <CardDescription>{t('common.promoUsageHistoryDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {usages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.promoNoUsages')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">{t('common.promoDiscountAmount')}</th>
                    <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">{t('common.promoDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {usages.map((u) => (
                    <tr key={u.id}>
                      <td className="py-2 font-medium text-gray-900 dark:text-white">{Number(u.discount_amount).toFixed(2)} ر.س</td>
                      <td className="py-2 text-gray-600 dark:text-gray-300">{format(new Date(u.used_at), 'PPp')}</td>
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
