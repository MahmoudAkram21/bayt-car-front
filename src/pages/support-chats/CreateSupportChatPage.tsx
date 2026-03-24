import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supportChatsService } from '../../services/supportChats.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRolePermissions } from '../../hooks/useRolePermissions';

export const CreateSupportChatPage = () => {
  const { t } = useTranslation();
  const { can } = useRolePermissions();
  const navigate = useNavigate();
  const canCreateTicket = can('SUPPORT_TICKETS', 'CREATE');
  const [formData, setFormData] = useState({
    service_request_id: '',
    subject: '',
    description: '',
    category: 'TECHNICAL_ISSUE',
    priority: 'MEDIUM',
  });

  // Create ticket mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => supportChatsService.createTicket(data),
    onSuccess: (response) => {
      navigate(`/support-chats/${response.data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateTicket) return;
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* Back Button */}
      <Link to="/support-chats" className="inline-block">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft size={20} />
          {t('common.back', 'Back')}
        </Button>
      </Link>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('supportChats.createNew', 'Create New Support Ticket')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={!canCreateTicket || createMutation.isPending} className="space-y-6">
            {/* Service Request Id */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supportChats.relatedRequest', 'Related Service Request')} *
              </label>
              <Input
                name="service_request_id"
                value={formData.service_request_id}
                onChange={handleChange}
                required
                placeholder={t('supportChats.serviceRequestPlaceholder', 'Paste service request UUID')}
                className="w-full"
              />
              {formData.service_request_id && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('supportChats.relatedRequestHint', 'Your support ticket will be linked to this request')}
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supportChats.subject', 'Subject')} *
              </label>
              <Input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t('supportChats.subjectPlaceholder', 'Brief subject of your issue')}
                required
                minLength={5}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supportChats.description', 'Description')} *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('supportChats.descriptionPlaceholder', 'Describe your issue in detail...')}
                required
                minLength={10}
                rows={5}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supportChats.category', 'Category')}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="TECHNICAL_ISSUE">{t('supportChats.categoryTechnical', 'Technical Issue')}</option>
                <option value="BILLING_PAYMENT">{t('supportChats.categoryBilling', 'Billing / Payment')}</option>
                <option value="SERVICE_QUALITY">{t('supportChats.categoryServiceQuality', 'Service Quality')}</option>
                <option value="PROVIDER_ISSUE">{t('supportChats.categoryProviderIssue', 'Provider Issue')}</option>
                <option value="FEATURE_REQUEST">{t('supportChats.categoryFeatureRequest', 'Feature Request')}</option>
                <option value="ACCOUNT_ISSUE">{t('supportChats.categoryAccountIssue', 'Account Issue')}</option>
                <option value="OTHER">{t('supportChats.categoryOther', 'Other')}</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('supportChats.priority', 'Priority')}
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="LOW">{t('supportChats.priorityLow', 'Low')}</option>
                <option value="MEDIUM">{t('supportChats.priorityMedium', 'Medium')}</option>
                <option value="HIGH">{t('supportChats.priorityHigh', 'High')}</option>
                <option value="URGENT">{t('supportChats.priorityUrgent', 'Urgent')}</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={!canCreateTicket || createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending
                  ? t('common.creating', 'Creating...')
                  : t('supportChats.createTicket', 'Create Ticket')}
              </Button>
              <Link to="/support-chats" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {t('common.cancel', 'Cancel')}
                </Button>
              </Link>
            </div>

            {createMutation.error && (
              <div className="p-4 bg-red-100 text-red-800 rounded-lg text-sm">
                {(createMutation.error as any).message}
              </div>
            )}
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
