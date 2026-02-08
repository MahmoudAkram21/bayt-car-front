import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Truck, MapPin, User, Phone, Calendar, DollarSign, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { furnitureDeliveryService, type FurnitureDeliveryRequest } from '../../services/furnitureDelivery.service';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  ACCEPTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  REJECTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const statusIcons: Record<string, React.ReactNode> = {
  OPEN: <Clock className="h-4 w-4" />,
  ACCEPTED: <CheckCircle2 className="h-4 w-4" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
  REJECTED: <XCircle className="h-4 w-4" />,
};

const statusLabels: Record<string, string> = {
  OPEN: 'مفتوح',
  ACCEPTED: 'مقبول',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  REJECTED: 'مرفوض',
};

export const FurnitureDeliveryPage = () => {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['furniture-delivery-requests', activeStatus, page],
    queryFn: () => furnitureDeliveryService.getAllRequests({
      status: activeStatus || undefined,
      page,
      limit: 20,
    }),
  });

  const requests = data?.data ?? [];
  const pagination = data?.pagination;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '—';
    return `${price.toLocaleString()} ر.س`;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              توصيل العفش
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              طلبات توصيل العفش بأسعار محددة من العملاء
            </p>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <Card className="mb-6 rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-white">فلترة حسب الحالة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeStatus === null ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl"
              onClick={() => { setActiveStatus(null); setPage(1); }}
            >
              الكل
            </Button>
            {['OPEN', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <Button
                key={status}
                variant={activeStatus === status ? 'default' : 'outline'}
                size="sm"
                className="rounded-xl"
                onClick={() => { setActiveStatus(status); setPage(1); }}
              >
                {statusLabels[status]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Truck className="h-5 w-5 text-amber-500" />
            الطلبات {pagination && `(${pagination.total})`}
          </CardTitle>
          <CardDescription>
            العميل يحدد السعر ومقدم الخدمة يقبل أو يرفض بدون تفاوض
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="py-12 text-center text-red-600 dark:text-red-400">
              حدث خطأ في تحميل الطلبات
            </div>
          )}

          {!isLoading && requests.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              لا توجد طلبات
            </div>
          )}

          {!isLoading && requests.length > 0 && (
            <div className="space-y-4">
              {requests.map((req: FurnitureDeliveryRequest) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[req.status]}`}>
                          {statusIcons[req.status]}
                          {statusLabels[req.status]}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          #{req.id}
                        </span>
                      </div>

                      {/* Customer Info */}
                      {req.customer && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{req.customer.name}</span>
                          <Phone className="h-3.5 w-3.5 text-gray-400 mr-2" />
                          <span dir="ltr">{req.customer.phone}</span>
                        </div>
                      )}

                      {/* Location */}
                      {req.address_city && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{[req.address_city, req.address_area].filter(Boolean).join(' - ')}</span>
                        </div>
                      )}

                      {/* Description */}
                      {req.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {req.description}
                        </p>
                      )}
                    </div>

                    {/* Price & Date */}
                    <div className="text-left">
                      <div className="flex items-center gap-1 text-lg font-bold text-amber-600 dark:text-amber-400">
                        <DollarSign className="h-5 w-5" />
                        {formatPrice(req.customer_offer_price ?? req.final_agreed_price)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(req.created_at)}
                      </div>

                      {/* Provider Info */}
                      {req.provider && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="text-green-600 dark:text-green-400">مقدم الخدمة:</span>{' '}
                          {req.provider.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                السابق
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                صفحة {page} من {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Note */}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>ملاحظة:</strong> العميل يحدد السعر عند إنشاء الطلب من التطبيق، ومقدمو الخدمة القريبون يرون الطلب ويمكنهم قبوله أو رفضه. لا يوجد تفاوض على السعر.
        </p>
      </div>
    </div>
  );
};
