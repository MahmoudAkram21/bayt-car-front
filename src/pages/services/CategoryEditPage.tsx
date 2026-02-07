import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { serviceService, type CategoryCreateInput } from '../../services/service.service';

const getName = (name: string | { en?: string; ar?: string } | null | undefined): string => {
  if (typeof name === 'string') return name;
  if (name && typeof name === 'object') return (name as { en?: string; ar?: string }).en || (name as { en?: string; ar?: string }).ar || '';
  return '';
};

export const CategoryEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', id],
    queryFn: () => serviceService.getCategoryById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CategoryCreateInput>) => serviceService.updateCategory(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
      navigate(`/categories/${id}`);
    },
  });

  const cat = category as { id: string; name?: unknown; slug?: string; description?: unknown; icon_url?: string; icon?: string; sort_order?: number } | undefined;
  const initialForm: CategoryCreateInput = {
    name: cat ? getName(cat.name) : '',
    slug: cat?.slug ?? '',
    description: cat ? (typeof cat.description === 'string' ? cat.description : getName(cat.description)) : '',
    icon_url: cat?.icon_url ?? (cat as { icon?: string })?.icon ?? '',
    sort_order: cat?.sort_order ?? 0,
  };

  const [form, setForm] = useState(initialForm);

  // Sync form when category loads
  useEffect(() => {
    if (cat) {
      setForm({
        name: getName(cat.name),
        slug: cat.slug ?? '',
        description: typeof cat.description === 'string' ? cat.description : getName(cat.description),
        icon_url: cat.icon_url ?? (cat as { icon?: string }).icon ?? '',
        sort_order: cat.sort_order ?? 0,
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      icon_url: form.icon_url || undefined,
      sort_order: form.sort_order ?? 0,
    });
  };

  if (isLoading || !id) {
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

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2 text-gray-600 dark:text-gray-400"
          onClick={() => navigate(`/categories/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Category
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Edit Category
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Update category details
        </p>
      </div>

      <Card className="max-w-2xl rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Category form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="rounded-xl bg-teal-600 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Update'}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate(`/categories/${id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
