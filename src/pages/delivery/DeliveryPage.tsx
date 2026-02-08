import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Package, Wrench, RefreshCw } from 'lucide-react';
import { serviceCategoryService, type ServiceCategory } from '../../services/serviceCategory.service';
import { serviceService } from '../../services/service.service';

export const DeliveryPage = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const { data: categoriesData, isLoading: catLoading, error: catError } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => serviceCategoryService.list({ is_active: true }),
  });
  const categories = categoriesData?.data ?? [];

  const { data: servicesData, isLoading: svcLoading } = useQuery({
    queryKey: ['services-by-category', activeCategoryId],
    queryFn: () => serviceService.getAllServices({ categoryId: activeCategoryId ?? undefined }),
    enabled: true,
  });
  const services = servicesData?.data ?? [];

  const getName = (name: any) => (typeof name === 'string' ? name : name?.ar ?? name?.en ?? '—');

  return (
    <div className="animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          توصيل طلبات
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          فئات الخدمات: أصلاح منزلي، مبيدات ومكافحة، تنظيف خزان، قاطع بنزين، أخرى. السعر تفاوضي مع تحديد الموقع ووصف الخدمة.
        </p>
      </div>

      {/* Tabs: الفئات */}
      <Card className="mb-6 rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-white">اختر الفئة</CardTitle>
          <CardDescription>عرض الخدمات حسب الفئة (تبويبات أو قائمة)</CardDescription>
        </CardHeader>
        <CardContent>
          {catLoading && (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          )}
          {catError && (
            <p className="py-4 text-center text-red-600 dark:text-red-400">فشل تحميل الفئات.</p>
          )}
          {!catLoading && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategoryId === null ? 'default' : 'outline'}
                size="sm"
                className="rounded-xl"
                onClick={() => setActiveCategoryId(null)}
              >
                الكل
              </Button>
              {categories.map((c: ServiceCategory) => (
                <Button
                  key={c.id}
                  variant={activeCategoryId === c.id ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setActiveCategoryId(c.id)}
                >
                  {c.name_ar}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* List: الخدمات */}
      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Package className="h-5 w-5 text-amber-500" />
            الخدمات {activeCategoryId != null ? `— ${categories.find((c: ServiceCategory) => c.id === activeCategoryId)?.name_ar ?? ''}` : ''}
          </CardTitle>
          <CardDescription>
            السعر تفاوضي. يحدد العميل الموقع ووصف الخدمة عند إنشاء الطلب من تطبيق الموبايل.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {svcLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          )}
          {!svcLoading && services.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              لا توجد خدمات في هذه الفئة. أضف خدمات من صفحة الخدمات وربطها بالفئة.
            </div>
          )}
          {!svcLoading && services.length > 0 && (
            <ul className="space-y-3">
              {services.map((s: any) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{getName(s.name)}</p>
                      {s.description && (
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{s.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {s.gps_radius_km != null && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            نطاق {s.gps_radius_km} كم
                          </span>
                        )}
                        {s.is_negotiable && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            تفاوضي
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <a href={`/services/${s.id}`}>عرض التفاصيل</a>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>ملاحظة:</strong> إنشاء طلب توصيل (تحديد الموقع، وصف الخدمة، السعر التفاوضي) يتم من تطبيق العميل. من لوحة الإدارة يمكنك إدارة الفئات ونطاق GPS لكل خدمة من صفحة الخدمات.
        </p>
      </div>
    </div>
  );
};
