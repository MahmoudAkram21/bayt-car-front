import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Briefcase, Calendar, CreditCard, Clock, MapPin, User } from 'lucide-react';
import { ServiceRequestConversationPanel } from '../../components/service-request-chat/ServiceRequestConversationPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { bookingService } from '../../services/booking.service';
import { serviceRequestConversationService } from '../../services/serviceRequestConversation.service';

interface BookingDetailsModalProps {
  bookingId: string | null;
  onClose: () => void;
}

const getName = (name: unknown): string => {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object' && name !== null) {
    const n = name as Record<string, string>;
    return n.en || n.ar || '';
  }
  return '';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    OPEN: 'bg-amber-100 text-amber-700',
    PENDING_PROVIDER_OFFER: 'bg-purple-100 text-purple-700',
    PENDING_CUSTOMER_APPROVAL: 'bg-blue-100 text-blue-700',
    ACCEPTED: 'bg-indigo-100 text-indigo-700',
    COMPLETED: 'bg-teal-100 text-teal-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REJECTED: 'bg-gray-100 text-gray-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

const fmtDate = (val: unknown, fmt = 'PPP p') => {
  if (!val) return null;
  try {
    return format(new Date(val as string), fmt);
  } catch {
    return null;
  }
};

const getConversationId = (booking: Record<string, unknown> | null | undefined): string | null => {
  if (!booking) return null;

  const directValue = booking.conversationId ?? booking.conversation_id;
  if (typeof directValue === 'string' && directValue.trim()) return directValue;

  const nestedConversation =
    typeof booking.conversation === 'object' && booking.conversation !== null
      ? (booking.conversation as Record<string, unknown>)
      : null;

  if (nestedConversation) {
    const nestedId = nestedConversation.id ?? nestedConversation.conversationId ?? nestedConversation.conversation_id;
    if (typeof nestedId === 'string' && nestedId.trim()) return nestedId;
  }

  return null;
};

const getParticipantIds = (booking: Record<string, unknown> | null | undefined) => {
  if (!booking) {
    return { customerIds: [] as string[], providerIds: [] as string[] };
  }

  const customer = typeof booking.customer === 'object' && booking.customer !== null
    ? (booking.customer as Record<string, unknown>)
    : null;
  const owner = typeof booking.owner === 'object' && booking.owner !== null
    ? (booking.owner as Record<string, unknown>)
    : null;
  const provider = typeof booking.provider === 'object' && booking.provider !== null
    ? (booking.provider as Record<string, unknown>)
    : null;
  const providerUser = provider && typeof provider.user === 'object' && provider.user !== null
    ? (provider.user as Record<string, unknown>)
    : null;

  const customerIds = [
    booking.customerId,
    booking.customer_id,
    booking.ownerId,
    booking.owner_id,
    customer?.id,
    owner?.id,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  const providerIds = [
    booking.providerId,
    booking.provider_id,
    provider?.id,
    provider?.userId,
    provider?.user_id,
    providerUser?.id,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return {
    customerIds: Array.from(new Set(customerIds)),
    providerIds: Array.from(new Set(providerIds)),
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string; message?: string } } }).response;
    const apiMessage = response?.data?.error ?? response?.data?.message;
    if (apiMessage) return apiMessage;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const BookingDetailsModal = ({ bookingId, onClose }: BookingDetailsModalProps) => {
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  const booking = ((rawData as Record<string, unknown> | undefined)?.serviceRequest ??
    rawData) as Record<string, unknown> | null | undefined;
  const conversationId = getConversationId(booking);
  const { customerIds, providerIds } = getParticipantIds(booking);

  const { data: messages = [], isLoading: isMessagesLoading, error: messagesError } = useQuery({
    queryKey: ['service-request-conversation-messages', conversationId],
    queryFn: () => serviceRequestConversationService.getMessages(conversationId!),
    enabled: !!conversationId,
  });

  const customerName =
    getName((booking?.customer as Record<string, unknown> | undefined)?.name) ||
    getName((booking?.owner as Record<string, unknown> | undefined)?.name) ||
    'Unknown customer';

  const providerRecord =
    typeof booking?.provider === 'object' && booking?.provider !== null
      ? (booking.provider as Record<string, unknown>)
      : null;
  const providerUser =
    providerRecord && typeof providerRecord.user === 'object' && providerRecord.user !== null
      ? (providerRecord.user as Record<string, unknown>)
      : null;

  const providerName =
    getName(providerRecord?.name) ||
    getName(providerUser?.name) ||
    getName(providerRecord?.businessName) ||
    'Provider not assigned';

  const bookingDetailsError = error ? getErrorMessage(error, 'Error loading booking details.') : null;
  const conversationError = messagesError
    ? getErrorMessage(messagesError, 'Something went wrong while loading the conversation.')
    : null;

  const finalPrice = booking?.finalPrice ?? booking?.final_agreed_price;
  const createdAt = booking?.createdAt ?? booking?.created_at;
  const scheduledDate = booking?.scheduledDate ?? booking?.scheduled_date;
  const cancelReason = booking?.cancelReason ?? booking?.cancel_reason;
  const cancelledAt = booking?.cancelledAt ?? booking?.cancelled_at;
  const isPaid = Boolean(booking?.is_paid ?? booking?.isPaid);
  const locationParts = [
    booking?.address_building,
    booking?.address_street,
    booking?.address_area,
    booking?.address_city,
  ].filter((part): part is string => typeof part === 'string' && part.trim().length > 0);
  const hasLocation = locationParts.length > 0;
  const cancelReasonText = typeof cancelReason === 'string' ? cancelReason : '';
  const cancelledAtValue = typeof cancelledAt === 'string' ? cancelledAt : null;

  return (
    <Dialog open={!!bookingId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[92vh] max-w-[96vw] overflow-hidden p-0 sm:max-w-6xl xl:max-w-7xl">
        <DialogHeader className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Service Request Details
              </DialogTitle>
              {booking && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{String(booking.id ?? '-')}</span>
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created {fmtDate(createdAt) ?? '-'}
                  </span>
                </div>
              )}
            </div>

            {booking && (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(String(booking.status ?? ''))}`}>
                {String(booking.status ?? 'UNKNOWN')}
              </span>
            )}
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {bookingDetailsError && !isLoading && (
          <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
            {bookingDetailsError}
          </div>
        )}

        {booking && !isLoading && !bookingDetailsError && (
          <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <div className="min-h-0 overflow-y-auto px-6 py-6">
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Customer</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Request owner</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <p className="font-medium text-gray-900 dark:text-white">{customerName}</p>
                      <p>{String((booking.customer as Record<string, unknown> | undefined)?.email ?? (booking.owner as Record<string, unknown> | undefined)?.email ?? 'No email')}</p>
                      <p>{String((booking.customer as Record<string, unknown> | undefined)?.phone ?? (booking.owner as Record<string, unknown> | undefined)?.phone ?? 'No phone')}</p>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Provider</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Assigned participant</p>
                      </div>
                    </div>

                    {providerRecord ? (
                      <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium text-gray-900 dark:text-white">{providerName}</p>
                        <p>{String(providerRecord.email ?? providerUser?.email ?? 'No email')}</p>
                        <p>{String(providerRecord.phone ?? providerUser?.phone ?? 'No phone')}</p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm italic text-gray-500 dark:text-gray-400">No provider assigned yet.</p>
                    )}
                  </section>
                </div>

                <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
                  <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-800 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service information</h3>
                      <p className="mt-2 text-base font-medium text-gray-900 dark:text-white">
                        {getName((booking.service as Record<string, unknown> | undefined)?.name) || 'Unknown service'}
                      </p>
                      {typeof booking.description === 'string' && booking.description.trim() && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                          {booking.description}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl bg-teal-50 px-4 py-3 text-right dark:bg-teal-950/30">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                        Agreed Price
                      </p>
                      <p className="mt-1 text-2xl font-bold text-teal-700 dark:text-teal-300">
                        SAR {finalPrice != null ? Number(finalPrice).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/30">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        Schedule Date
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {fmtDate(scheduledDate) ?? 'As soon as possible'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/30">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <CreditCard className="h-4 w-4" />
                        Payment
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{String(booking.payment_method ?? booking.paymentMethod ?? 'Pending')}</span>
                        {isPaid && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Paid
                          </span>
                        )}
                      </div>
                    </div>

                    {hasLocation && (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/30 md:col-span-2">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <MapPin className="h-4 w-4" />
                          Location
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{locationParts.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </section>

                {cancelReasonText && (
                  <section className="rounded-3xl border border-red-100 bg-red-50/70 p-5 dark:border-red-900 dark:bg-red-950/20">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Cancellation Reason</p>
                    <p className="mt-2 text-sm leading-6 text-red-600 dark:text-red-300">{cancelReasonText}</p>
                    {cancelledAtValue && (
                      <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                        Cancelled on {fmtDate(cancelledAtValue, 'PPP') ?? '-'}
                      </p>
                    )}
                  </section>
                )}
              </div>
            </div>

            <aside className="min-h-0 border-t border-gray-200 lg:border-l lg:border-t-0 dark:border-gray-800">
              <ServiceRequestConversationPanel
                conversationId={conversationId}
                messages={messages}
                isLoading={isMessagesLoading}
                errorMessage={conversationError}
                customerName={customerName}
                providerName={providerName}
                customerIds={customerIds}
                providerIds={providerIds}
              />
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
