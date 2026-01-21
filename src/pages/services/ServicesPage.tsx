import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, Wrench } from 'lucide-react';
import { serviceService } from '../../services/service.service';
import { format } from 'date-fns';

export const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => serviceService.getAllCategories(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['services', { categoryId: filterCategory, isActive: filterStatus, search: searchTerm }],
    queryFn: () => serviceService.getAllServices({
      categoryId: filterCategory !== 'all' ? filterCategory : undefined,
      isActive: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined,
      search: searchTerm || undefined,
    }),
  });

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all services across providers
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getName(cat.name)}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            All Services
          </CardTitle>
          <CardDescription>
            {data ? `${data.total} services found` : 'View services offered by all providers'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center text-gray-500 py-8">
              <p>Loading services...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>Error loading services. Please try again.</p>
            </div>
          )}

          {data && data.data.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No services found.</p>
            </div>
          )}

          {data && data.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.data.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium">{getName(service.name)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getName(service.provider?.businessName) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getName(service.category?.name) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        ${service.price.toFixed(2)}
                        {service.isNegotiable && ' (Negotiable)'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{service.duration} min</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
