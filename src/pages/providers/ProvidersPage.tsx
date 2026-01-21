import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search, Building2 } from 'lucide-react';
import { providerService } from '../../services/provider.service';
import { format } from 'date-fns';

const tabs = ['all', 'pending', 'verified', 'suspended'];

export const ProvidersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['providers', { verified: activeTab === 'verified', search: searchTerm }],
    queryFn: () => providerService.getAllProviders({
      verified: activeTab === 'verified' ? true : activeTab === 'pending' ? false : undefined,
      search: searchTerm || undefined,
    }),
  });

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  const filteredData = data?.data.filter((provider) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return !provider.isVerified;
    if (activeTab === 'verified') return provider.isVerified && !provider.isSuspended;
    if (activeTab === 'suspended') return provider.isSuspended;
    return true;
  }) || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Service Providers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and verify service providers
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by business name or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab} {tab !== 'all' && `(${filteredData.length})`}
          </button>
        ))}
      </div>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {activeTab === 'all' && 'All Providers'}
            {activeTab === 'pending' && 'Pending Verification'}
            {activeTab === 'verified' && 'Verified Providers'}
            {activeTab === 'suspended' && 'Suspended Providers'}
          </CardTitle>
          <CardDescription>
            {data ? `${filteredData.length} providers found` : 'View and manage service providers'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center text-gray-500 py-8">
              <p>Loading providers...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">
              <p>Error loading providers. Please try again.</p>
            </div>
          )}

          {filteredData.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              <p>No providers found.</p>
            </div>
          )}

          {filteredData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium">{getName(provider.businessName)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getName(provider.owner?.name) || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getName(provider.city)}</td>
                      <td className="px-4 py-3 text-sm">⭐ {provider.averageRating?.toFixed(1) || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {provider.isSuspended ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Suspended</span>
                        ) : provider.isVerified ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(provider.createdAt), 'MMM dd, yyyy')}
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
