import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Search, Package, Plus, Pencil, Trash2, Eye, X } from 'lucide-react';
import { serviceService, type CategoryCreateInput } from '../../services/service.service';

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
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryRow | null>(null);
  const [showCategoryId, setShowCategoryId] = useState<string | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState<CategoryCreateInput>({ name: '', slug: '', description: '', sort_order: 0 });

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => serviceService.getAllCategories(),
  });

  const { data: showCategory, isLoading: showLoading } = useQuery({
    queryKey: ['category', showCategoryId],
    queryFn: () => serviceService.getCategoryById(showCategoryId!),
    enabled: !!showCategoryId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryCreateInput) => serviceService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setAddOpen(false);
      setForm({ name: '', slug: '', description: '', sort_order: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryCreateInput> }) =>
      serviceService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditCategory(null);
      setForm({ name: '', slug: '', description: '', sort_order: 0 });
    },
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

  const openEdit = (cat: CategoryRow) => {
    setEditCategory(cat);
    setForm({
      name: getName(cat.name),
      slug: cat.slug,
      description: typeof cat.description === 'string' ? cat.description : getName(cat.description),
      icon_url: cat.icon_url ?? undefined,
      sort_order: cat.sort_order ?? 0,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      description: form.description || undefined,
      icon_url: form.icon_url || undefined,
      sort_order: form.sort_order ?? 0,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    updateMutation.mutate({
      id: String(editCategory.id),
      data: {
        ...form,
        description: form.description || undefined,
        icon_url: form.icon_url || undefined,
        sort_order: form.sort_order ?? 0,
      },
    });
  };

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
          className="shrink-0 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg gap-2"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card className="mb-6 rounded-2xl border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border-gray-300 pl-10 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Package className="h-5 w-5" />
            All Categories
          </CardTitle>
          <CardDescription>
            {categories ? `${filteredCategories.length} categories found` : 'Manage service categories available for providers'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p>Error loading categories. Please try again.</p>
            </div>
          )}

          {filteredCategories.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Package className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No categories found</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                Try adjusting your search or add a new category
              </p>
            </div>
          )}

          {filteredCategories.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((category: CategoryRow) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-800"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getName(category.name)}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {getName(category.description) || 'No description'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">ID: {String(category.id)}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                        onClick={() => setShowCategoryId(String(category.id))}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                        onClick={() => openEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => setDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAddOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Category</h2>
              <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Category name"
                  className="mt-1 rounded-lg"
                  required
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="category-slug"
                  className="mt-1 rounded-lg"
                  required
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  value={form.description ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  className="mt-1 rounded-lg"
                />
              </div>
              <div>
                <Label>Icon URL (optional)</Label>
                <Input
                  value={form.icon_url ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1 rounded-lg"
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
                  className="mt-1 rounded-lg"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="rounded-xl bg-orange-600 hover:bg-orange-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditCategory(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Category</h2>
              <Button variant="ghost" size="sm" onClick={() => setEditCategory(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Category name"
                  className="mt-1 rounded-lg"
                  required
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="category-slug"
                  className="mt-1 rounded-lg"
                  required
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  value={form.description ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  className="mt-1 rounded-lg"
                />
              </div>
              <div>
                <Label>Icon URL (optional)</Label>
                <Input
                  value={form.icon_url ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1 rounded-lg"
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
                  className="mt-1 rounded-lg"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="rounded-xl bg-orange-600 hover:bg-orange-700" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Update'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditCategory(null)} className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Category Modal */}
      {showCategoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCategoryId(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Category Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCategoryId(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {showLoading && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
              </div>
            )}
            {showCategory && (
              <div className="space-y-3 text-sm">
                <p><span className="font-medium text-gray-500 dark:text-gray-400">ID:</span> {String((showCategory as CategoryRow).id)}</p>
                <p><span className="font-medium text-gray-500 dark:text-gray-400">Name:</span> {getName((showCategory as CategoryRow).name)}</p>
                <p><span className="font-medium text-gray-500 dark:text-gray-400">Slug:</span> {(showCategory as CategoryRow).slug}</p>
                <p><span className="font-medium text-gray-500 dark:text-gray-400">Description:</span> {getName((showCategory as CategoryRow).description) || '—'}</p>
                <p><span className="font-medium text-gray-500 dark:text-gray-400">Sort order:</span> {(showCategory as CategoryRow).sort_order ?? '—'}</p>
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" onClick={() => setShowCategoryId(null)} className="rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      )}

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
