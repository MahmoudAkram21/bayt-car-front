import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Package, Plus, Pencil, Trash2, Eye, LayoutGrid, List } from 'lucide-react';
import { serviceService } from '../../services/service.service';

type CategoryRow = {
  id: number | string;
  name: string | { en?: string; ar?: string };
  slug: string;
  description?: string | { en?: string; ar?: string } | null;
  icon_url?: string | null;
  sort_order?: number;
};

const getName = (name: string | { en?: string; ar?: string } | null | undefined): string => {
  if (typeof name === 'string') return name;
  if (name && typeof name === 'object') return name.en || name.ar || 'N/A';
  return 'N/A';
};

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteCategory, setDeleteCategory] = useState<CategoryRow | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => serviceService.getAllCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteCategory(null);
    },
  });

  const filteredCategories = (categories?.filter((cat: CategoryRow) => {
    const name = typeof cat.name === 'string' ? cat.name : cat.name?.en || cat.name?.ar || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || []) as CategoryRow[];

  const handleDelete = () => {
    if (!deleteCategory) return;
    deleteMutation.mutate(String(deleteCategory.id));
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Service Categories
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            Manage service categories: add, update, delete, and view details
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 rounded-xl bg-teal-600 shadow-lg gap-2 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500"
          onClick={() => navigate('/categories/new')}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stat card — same style as Commissions */}
      <div className="mb-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-600 dark:bg-gray-800/50">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Categories</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{categories?.length ?? 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 shadow-sm">
              <Package className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-teal-200 bg-teal-50 shadow-sm dark:border-teal-800 dark:bg-teal-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Visible in list</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{categories?.length ?? 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <Package className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">With description</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{categories?.filter((c: CategoryRow) => { const d = c.description; if (!d) return false; if (typeof d === 'string') return d.trim().length > 0; const o = d as { en?: string; ar?: string }; return !!(o?.en || o?.ar); }).length ?? 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-gray-300 pl-10 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div className="flex rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-hidden">
              <button type="button" onClick={() => setViewMode('cards')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-teal-500 text-white dark:bg-teal-600' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'}`}>
                <LayoutGrid className="h-4 w-4" /> Cards
              </button>
              <button type="button" onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-teal-500 text-white dark:bg-teal-600' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'}`}>
                <List className="h-4 w-4" /> List
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Package className="h-5 w-5 text-teal-500" />
            All Categories
          </CardTitle>
          <CardDescription>
            {categories ? `${filteredCategories.length} categories found` : 'Manage service categories available for providers'}
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
              <p>Error loading categories. Please try again.</p>
            </div>
          )}

          {filteredCategories.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Package className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No categories found</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                Try adjusting your search or add a new category
              </p>
            </div>
          )}

          {viewMode === 'cards' && filteredCategories.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((category: CategoryRow) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-teal-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-600"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getName(category.name)}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {getName(category.description) || 'No description'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">ID: {String(category.id)}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 focus:ring-2 focus:ring-teal-500" onClick={() => navigate(`/categories/${category.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 focus:ring-2 focus:ring-teal-500" onClick={() => navigate(`/categories/${category.id}/edit`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => setDeleteCategory(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && filteredCategories.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Slug</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCategories.map((category: CategoryRow) => (
                    <tr key={category.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getName(category.name)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{category.slug}</td>
                      <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getName(category.description) || '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-teal-600 hover:text-teal-700 dark:text-teal-400" title="View" onClick={() => navigate(`/categories/${category.id}`)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-teal-600 hover:text-teal-700 dark:text-teal-400" title="Edit" onClick={() => navigate(`/categories/${category.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-red-600 hover:text-red-700" title="Delete" onClick={() => setDeleteCategory(category)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirm Modal */}
      {deleteCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteCategory(null)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Category?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete &quot;{getName(deleteCategory.name)}&quot;? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-2">
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
              <Button variant="outline" onClick={() => setDeleteCategory(null)} className="rounded-xl">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
