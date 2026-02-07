import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { serviceService, type CategoryCreateInput } from '../../services/service.service';

export const CategoryNewPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CategoryCreateInput>({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryCreateInput) => serviceService.createCategory(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigate(data?.id ? `/categories/${data.id}` : '/categories');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      description: form.description || undefined,
      icon_url: form.icon_url || undefined,
      sort_order: form.sort_order ?? 0,
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2 text-gray-600 dark:text-gray-400"
          onClick={() => navigate('/categories')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Add Category
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Create a new service category
        </p>
      </div>

      <Card className="max-w-2xl rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">New category</CardTitle>
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
              <Button type="submit" className="rounded-xl bg-teal-600 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate('/categories')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
