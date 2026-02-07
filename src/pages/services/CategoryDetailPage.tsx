import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Package, Pencil, Hash, FileText, ArrowUpDown } from 'lucide-react';
import { serviceService } from '../../services/service.service';

const getName = (name: string | { en?: string; ar?: string } | null | undefined): string => {
  if (typeof name === 'string') return name;
  if (name && typeof name === 'object') return name.en || name.ar || 'N/A';
  return 'N/A';
};

export const CategoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', id],
    queryFn: () => serviceService.getCategoryById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-16">
        <p className="text-gray-600 dark:text-gray-400">Category not found.</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/categories')}>
          Back to Categories
        </Button>
      </div>
    );
  }

  const cat = category as { id: string; name?: unknown; slug?: string; description?: unknown; icon_url?: string; icon?: string; sort_order?: number; createdAt?: string; updatedAt?: string };
  const iconUrl = cat.icon_url ?? (cat as { icon?: string }).icon;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2 text-gray-600 dark:text-gray-400"
          onClick={() => navigate('/categories')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
        <Button
          size="sm"
          className="rounded-xl bg-teal-600 gap-2 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500"
          onClick={() => navigate(`/categories/${id}/edit`)}
        >
          <Pencil className="h-4 w-4" />
          Edit Category
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Category Details
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Full details for this service category
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-48 w-full shrink-0 bg-gradient-to-br from-teal-500/20 to-teal-600/10 sm:h-56 sm:w-64">
                {iconUrl ? (
                  <img src={iconUrl} alt={getName(cat.name)} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-20 w-20 text-teal-500/60 dark:text-teal-400/50" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getName(cat.name)}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Slug: {cat.slug}</p>
                {getName(cat.description) && getName(cat.description) !== 'N/A' && (
                  <p className="mt-3 line-clamp-3 text-gray-600 dark:text-gray-400">
                    {getName(cat.description)}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-base text-gray-900 dark:text-white">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Hash className="h-4 w-4 text-teal-500 shrink-0" />
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">ID</p>
                  <p className="text-gray-900 dark:text-white">{String(cat.id)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ArrowUpDown className="h-4 w-4 text-teal-500 shrink-0" />
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Sort order</p>
                  <p className="text-gray-900 dark:text-white">{cat.sort_order ?? '—'}</p>
                </div>
              </div>
              {cat.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-teal-500 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(cat.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {cat.updatedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-teal-500 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">Updated</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(cat.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
