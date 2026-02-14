import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Truck, MapPin, User, Phone, Calendar, DollarSign, CheckCircle2, Clock, XCircle, AlertCircle, LayoutGrid, Map as MapIcon, Info, RefreshCw } from 'lucide-react';
import { furnitureDeliveryService, type FurnitureDeliveryRequest } from '../../services/furnitureDelivery.service';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PENDING_CUSTOMER_APPROVAL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ACCEPTED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  REJECTED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const statusIcons: Record<string, React.ReactNode> = {
  OPEN: <Clock className="h-4 w-4" />,
  PENDING_CUSTOMER_APPROVAL: <AlertCircle className="h-4 w-4" />,
  ACCEPTED: <CheckCircle2 className="h-4 w-4" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
  REJECTED: <XCircle className="h-4 w-4" />,
};

const statusLabels: Record<string, string> = {
  OPEN: 'مفتوح',
  PENDING_CUSTOMER_APPROVAL: 'بانتظار موافقة العميل',
  ACCEPTED: 'مقبول',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  REJECTED: 'مرفوض',
};

type ViewMode = 'list' | 'map';

export const FurnitureDeliveryPage = () => {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['furniture-delivery-requests', activeStatus, page],
    queryFn: () => furnitureDeliveryService.getAllRequests({
      status: activeStatus || undefined,
      page,
      limit: 100, // Fetch more for map view
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
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg text-white">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              توصيل العفش
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              إدارة طلبات التوصيل والتفاوض.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl gap-2 hover:bg-white/50 hover:text-amber-600 dark:hover:bg-gray-800/50 dark:hover:text-amber-400"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>

          <div className="flex rounded-xl border border-gray-200 bg-white/50 dark:border-gray-600 dark:bg-gray-800/50 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              قائمة
            </button>
            <div className="w-px bg-gray-200 dark:bg-gray-600" />
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              خريطة
            </button>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <Card className="border-gray-200 bg-white/60 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeStatus === null ? 'default' : 'outline'}
              size="sm"
              className={`rounded-xl transition-all ${activeStatus === null ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400'}`}
              onClick={() => { setActiveStatus(null); setPage(1); }}
            >
              الكل
            </Button>
            {['OPEN', 'PENDING_CUSTOMER_APPROVAL', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <Button
                key={status}
                variant={activeStatus === status ? 'default' : 'outline'}
                size="sm"
                className={`rounded-xl transition-all ${activeStatus === status ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400'}`}
                onClick={() => { setActiveStatus(status); setPage(1); }}
              >
                {statusLabels[status]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Truck className="h-5 w-5 text-amber-500" />
            الطلبات {pagination && `(${pagination.total})`}
          </CardTitle>
          <CardDescription>
            {viewMode === 'map' ? 'عرض مواقع الطلبات النشطة' : 'قائمة الطلبات وحالات التفاوض'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
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
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                <Truck className="h-12 w-12 text-amber-300 dark:text-amber-600" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">لا توجد طلبات</p>
              <p className="mt-2 text-gray-500 dark:text-gray-400">حاول تغيير حالة التصفية أو تحقق لاحقاً.</p>
            </div>
          )}

          {!isLoading && requests.length > 0 && (
            <>
              {viewMode === 'map' ? (
                <div className="h-[600px] w-full relative z-0">
                  <MapContainer center={[24.7136, 46.6753]} zoom={6} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {requests.map((req) => (
                      <Marker 
                        key={req.id} 
                        position={[parseFloat(req.latitude), parseFloat(req.longitude)]}
                      >
                        <Popup>
                          <div className="text-right p-1" dir="rtl">
                            <h3 className="font-bold text-sm mb-1 text-gray-900">طلب #{req.id}</h3>
                            <p className="text-xs text-gray-600 mb-1">{req.description}</p>
                            <p className="text-xs font-semibold text-amber-600">
                              {formatPrice(req.customer_offer_price ?? req.final_agreed_price)}
                            </p>
                            <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[req.status]}`}>
                              {statusLabels[req.status]}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              ) : (
                <div className="grid gap-4 p-6 sm:grid-cols-1 lg:grid-cols-2">
                  {requests.map((req: FurnitureDeliveryRequest) => (
                    <div
                      key={req.id}
                      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-amber-900"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        {/* Request Info */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[req.status]}`}>
                              {statusIcons[req.status]}
                              {statusLabels[req.status]}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                              #{req.id}
                            </span>
                          </div>

                          {/* Customer Info */}
                          {req.customer && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1.5">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{req.customer.name}</span>
                              <div className="mx-1 h-3 w-px bg-gray-300 dark:bg-gray-600" />
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              <span dir="ltr" className="font-mono text-xs">{req.customer.phone}</span>
                            </div>
                          )}

                          {/* Location */}
                          {req.address_city && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{[req.address_city, req.address_area].filter(Boolean).join(' - ')}</span>
                            </div>
                          )}

                          {/* Description */}
                          {req.description && (
                            <div className="mt-3 rounded-lg bg-gray-50/80 p-3 text-sm text-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
                              <p className="line-clamp-2">{req.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Price & Date */}
                        <div className="text-left flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-lg font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            <DollarSign className="h-5 w-5" />
                            {req.status === 'PENDING_CUSTOMER_APPROVAL' && req.provider_offer_price 
                              ? formatPrice(req.provider_offer_price) 
                              : formatPrice(req.customer_offer_price ?? req.final_agreed_price)
                            }
                          </div>
                          
                          {req.status === 'PENDING_CUSTOMER_APPROVAL' && (
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                              عرض مقدم خدمة
                            </span>
                          )}
                          {req.status === 'OPEN' && (
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                              عرض العميل
                            </span>
                          )}
                          
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(req.created_at)}
                          </div>

                          {/* Provider Info */}
                          {req.provider && (
                            <div className="mt-2 text-right">
                              <div className="text-[10px] text-gray-400">مقدم الخدمة</div>
                              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                                <Truck className="h-3 w-3 text-gray-400" />
                                {req.provider.name}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="col-span-full mt-4 flex items-center justify-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="rounded-xl w-24"
                      >
                        السابق
                      </Button>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                        {page} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-xl w-24"
                      >
                        التالي
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {viewMode === 'map' && (
         <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm dark:border-blue-900/30 dark:bg-blue-900/10">
            <p className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Info className="h-4 w-4" />
              <strong>تلميح:</strong> الخريطة تعرض جميع الطلبات المفلترة (بحد أقصى 100). اضغط على العلامة لعرض التفاصيل.
            </p>
         </div>
      )}
    </div>
  );
};
