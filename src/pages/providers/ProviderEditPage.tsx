import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

import { Label } from '../../components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { providerService } from '../../services/provider.service';
import { useRolePermissions } from '../../hooks/useRolePermissions';

const getName = (name: string | { en?: string; ar?: string } | undefined) => {
  if (typeof name === 'string') return name;
  return name?.en || name?.ar || '';
};

export const ProviderEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [bio, setBio] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const { can } = useRolePermissions();
  const canUpdateProvider = can('PROVIDERS', 'UPDATE');

  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['provider-detail', id],
    queryFn: () => providerService.getProviderDetail(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { bio?: string; is_verified?: boolean; is_suspended?: boolean }) =>
      providerService.adminUpdateProvider(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      navigate(`/providers/${id}`);
    },
  });

  useEffect(() => {
    if (provider) {
      setBio(getName(provider.description) || '');
      setIsVerified(provider.isVerified ?? false);
      setIsSuspended(provider.isSuspended ?? false);
    }
  }, [provider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdateProvider) return;
    updateMutation.mutate({ bio: bio || undefined, is_verified: isVerified, is_suspended: isSuspended });
  };

  if (isLoading || !provider) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 dark:text-gray-400">Provider not found.</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/providers')}>
          Back to Providers
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2"
          onClick={() => navigate(`/providers/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Edit Provider</CardTitle>
          <CardDescription>
            {getName(provider.businessName)} — Update bio and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={!canUpdateProvider || updateMutation.isPending} className="space-y-6">
            <div>
              <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Provider bio / description"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSuspended}
                  onChange={(e) => setIsSuspended(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Suspended</span>
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="rounded-xl gap-2 bg-orange-600 hover:bg-orange-700" disabled={!canUpdateProvider || updateMutation.isPending}>
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate(`/providers/${id}`)}>
                Cancel
              </Button>
            </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
