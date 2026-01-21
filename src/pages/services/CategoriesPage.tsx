import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Package, Plus } from 'lucide-react';
import { serviceService } from '../../services/service.service';

export const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => serviceService.getAllCategories(),
  });

  const filteredCategories = categories?.filter((cat) => {
    const name = typeof cat.name === 'string' ? cat.name : cat.name?.en || cat.name?.ar || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Service Categories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage service categories and classifications
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Categories
          </CardTitle>
          <CardDescription>
            {categories ? `${filteredCategories.length} categories found` : 'Manage service categories available for providers'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center text-gray-500 py-8">
              <p>Loading categories...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>Error loading categories. Please try again.</p>
            </div>
          )}

          {filteredCategories.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              <p>No categories found.</p>
            </div>
          )}

          {filteredCategories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{getName(category.name)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {getName(category.description) || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="text-xs text-gray-500">ID: {category.id.slice(0, 8)}...</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
