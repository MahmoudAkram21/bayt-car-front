import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Wrench, Tag, Coins, FileText, CheckCircle2, Hash, Info, MapPin, Truck, Plus, Trash2, Edit, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { serviceService } from '../../services/service.service';
import { serviceCategoryService } from '../../services/serviceCategory.service';

import type { MultilingualText, ServiceAttribute, AttributeOption } from '../../types';

const getName = (name: string | MultilingualText | null | undefined) => {
  if (typeof name === 'string') return name;
  return name?.en || name?.ar || '—';
};

const getDesc = (desc: string | MultilingualText | null | undefined) => {
  if (desc == null) return '';
  if (typeof desc === 'string') return desc;
  return desc?.en || desc?.ar || '';
};

export const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [gpsRadius, setGpsRadius] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Attribute Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ServiceAttribute | null>(null);
  const [attrFormData, setAttrFormData] = useState({
    labelEn: '',
    labelAr: '',
    options: [{ label: '', price: 0 }]
  });

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: () => serviceService.getServiceById(id!),
    enabled: !!id,
  });
  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => serviceCategoryService.list(),
  });
  const categories = categoriesData?.data ?? [];

  // Catalog Mutation
  const catalogMutation = useMutation({
    mutationFn: (payload: { category_id?: number | null; gps_radius_km?: number | null }) =>
      serviceService.updateServiceCatalog(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  // Attribute Mutations
  interface AttributePayload {
    label: MultilingualText;
    options: { label: string; price: number }[];
  }

  const createAttrMutation = useMutation({
    mutationFn: (payload: AttributePayload) => serviceService.createAttribute(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const updateAttrMutation = useMutation({
    mutationFn: (payload: { attrId: string; data: AttributePayload }) => 
      serviceService.updateAttribute(id!, payload.attrId, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteAttrMutation = useMutation({
    mutationFn: (attrId: string) => serviceService.deleteAttribute(id!, attrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', id] });
    }
  });

  const handleSaveCatalog = () => {
    const payload: { category_id?: number | null; gps_radius_km?: number | null } = {};
    if (categoryId !== '') payload.category_id = categoryId === 'none' ? null : parseInt(categoryId, 10);
    if (gpsRadius !== '') payload.gps_radius_km = gpsRadius.trim() ? parseFloat(gpsRadius) : null;
    if (Object.keys(payload).length === 0) return;
    catalogMutation.mutate(payload);
  };

  // Attribute Handlers
  const resetForm = () => {
    setEditingAttribute(null);
    setAttrFormData({ labelEn: '', labelAr: '', options: [{ label: '', price: 0 }] });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (attr: ServiceAttribute) => {
    setEditingAttribute(attr);
    // Parse label if object or string
    const labelEn = typeof attr.label === 'string' ? attr.label : attr.label?.en || '';
    const labelAr = typeof attr.label === 'string' ? attr.label : attr.label?.ar || '';
    
    // Map options
    const options = attr.options?.map((opt: AttributeOption) => ({
      label: opt.label,
      price: Number(opt.price_adjustment)
    })) || [{ label: '', price: 0 }];

    setAttrFormData({
      labelEn: labelEn || labelAr, // Fallback
      labelAr: labelAr || labelEn,
      options: options.length ? options : [{ label: '', price: 0 }]
    });
    setIsModalOpen(true);
  };

  const handleAttrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      label: { en: attrFormData.labelEn, ar: attrFormData.labelAr || attrFormData.labelEn },
      options: attrFormData.options.filter(o => o.label.trim() !== '')
    };

    if (editingAttribute) {
      updateAttrMutation.mutate({ attrId: String(editingAttribute.id), data: payload });
    } else {
      createAttrMutation.mutate(payload);
    }
  };

  const handleOptionChange = (index: number, field: 'label' | 'price', value: string | number) => {
    const newOptions = [...attrFormData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setAttrFormData({ ...attrFormData, options: newOptions });
  };

  const addOption = () => {
    setAttrFormData({
      ...attrFormData,
      options: [...attrFormData.options, { label: '', price: 0 }]
    });
  };

  const removeOption = (index: number) => {
    const newOptions = attrFormData.options.filter((_, i) => i !== index);
    setAttrFormData({ ...attrFormData, options: newOptions });
  };

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
    <div className="animate-fade-in relative">
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
                  {service.pricing_type && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                      <Tag className="h-3.5 w-3.5" />
                      {service.pricing_type}
                      {service.pricing_type === 'PER_UNIT' && service.unit_label && (
                        <span className="opacity-80"> — {service.base_price} ر.س / {service.unit_label}</span>
                      )}
                      {service.pricing_type === 'CUSTOMER_DEFINED' && (
                        <span className="opacity-80"> — العميل يحدد السعر</span>
                      )}
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

          {/* Attributes Management */}
          <Card className="rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 text-teal-500" />
                   Attributes & Pricing
                </CardTitle>
                <CardDescription>
                  Configure attributes (e.g., Dish Size) and their price adjustments
                </CardDescription>
              </div>
              <Button onClick={openCreateModal} size="sm" className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                <Plus className="h-4 w-4" /> Add Attribute
              </Button>
            </CardHeader>
            <CardContent>
              {service.attributes && service.attributes.length > 0 ? (
                <div className="space-y-4">
                  {service.attributes.map((attr) => (
                    <div key={attr.id} className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50 transition-all hover:border-teal-200 dark:hover:border-teal-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {typeof attr.label === 'string' ? attr.label : (attr.label?.en || attr.label?.ar)}
                          </h4>
                          {attr.options && attr.options.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {attr.options.map((opt: AttributeOption) => (
                                <span key={opt.id} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                  {opt.label}
                                  {Number(opt.price_adjustment) !== 0 && (
                                    <span className="text-amber-600 dark:text-amber-400 font-bold ml-1">
                                      {Number(opt.price_adjustment) > 0 ? '+' : ''}{Number(opt.price_adjustment)}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-gray-500 italic">No options defined</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(attr)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteAttrMutation.mutate(String(attr.id))} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 dark:border-gray-700 dark:bg-gray-800/30">
                  <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                    <CheckCircle2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="mt-2 font-medium text-gray-900 dark:text-white">No attributes defined</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add options like "Dish Size" or "Cable Length"</p>
                </div>
              )}
            </CardContent>
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
              {service.category && (
                <div className="flex items-center gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">الفئة</p>
                    <p className="text-gray-900 dark:text-white">{service.category?.name_ar ?? '—'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin: تعديل الفئة ونطاق GPS */}
          <Card className="rounded-2xl border-amber-200 dark:border-amber-800 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <MapPin className="h-5 w-5 text-amber-500" />
                نطاق التوصيل (GPS) والفئة
              </CardTitle>
              <CardDescription>تعديل الفئة ونطاق التوصيل بالكيلومتر من لوحة الإدارة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الفئة</Label>
                <select
                  value={categoryId !== '' ? categoryId : String(service.category_id ?? 'none')}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="none">— بدون فئة</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>نطاق GPS (كم)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder={String(service.gps_radius_km ?? '25')}
                  value={gpsRadius}
                  onChange={(e) => setGpsRadius(e.target.value)}
                  className="mt-1 rounded-lg"
                />
              </div>
              <Button size="sm" className="rounded-lg bg-amber-600 hover:bg-amber-700" onClick={handleSaveCatalog} disabled={catalogMutation.isPending}>
                حفظ التعديل
              </Button>
            </CardContent>
          </Card>

          {/* Furniture Delivery Requests Section - Only for CUSTOMER_DEFINED services */}
          {service.pricing_type === 'CUSTOMER_DEFINED' && (
            <Card className="rounded-2xl border-teal-200 dark:border-teal-800 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Truck className="h-5 w-5 text-teal-500" />
                  طلبات التوصيل
                </CardTitle>
                <CardDescription>
                  إدارة طلبات العملاء لهذه الخدمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  هذه الخدمة من نوع "العميل يحدد السعر". يمكنك عرض وإدارة جميع الطلبات المرتبطة بها.
                </p>
                <Link
                  to="/furniture-delivery"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
                >
                  <Truck className="h-4 w-4" />
                  عرض الطلبات
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Attribute Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-lg shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <CardTitle>{editingAttribute ? 'Edit Attribute' : 'Add New Attribute'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleAttrSubmit}>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label>Attribute Name</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">English</Label>
                      <Input 
                        value={attrFormData.labelEn}
                        onChange={(e) => setAttrFormData({...attrFormData, labelEn: e.target.value})}
                        placeholder="e.g. Dish Size"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Arabic</Label>
                      <Input 
                        value={attrFormData.labelAr}
                        onChange={(e) => setAttrFormData({...attrFormData, labelAr: e.target.value})}
                        placeholder="مثال: حجم الدش"
                        className="text-right"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Option
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {attrFormData.options.map((option, index) => (
                      <div key={index} className="flex gap-3 items-end">
                         <div className="flex-1 space-y-1">
                           <Label className="text-xs text-gray-500">Label</Label>
                           <Input 
                             value={option.label}
                             onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                             placeholder="e.g. 60cm"
                             required
                           />
                         </div>
                         <div className="w-28 space-y-1">
                           <Label className="text-xs text-gray-500">Added Price</Label>
                           <Input 
                             type="number"
                             value={option.price}
                             onChange={(e) => handleOptionChange(index, 'price', parseFloat(e.target.value))}
                             placeholder="0"
                           />
                         </div>
                         <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="h-10 w-10 text-red-500 hover:bg-red-50">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>
                <Button type="submit" disabled={createAttrMutation.isPending || updateAttrMutation.isPending}>
                  {editingAttribute ? 'Save Changes' : 'Create Attribute'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

