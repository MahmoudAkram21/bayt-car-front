import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { bookingService } from '../../services/booking.service';
import { format } from 'date-fns';
import { User, Briefcase, MapPin, CreditCard, Calendar, Clock } from 'lucide-react';

interface BookingDetailsModalProps {
  bookingId: string | null;
  onClose: () => void;
}

export const BookingDetailsModal = ({ bookingId, onClose }: BookingDetailsModalProps) => {
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  const getName = (name: any) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      CONFIRMED: 'bg-indigo-100 text-indigo-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-teal-100 text-teal-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <Dialog open={!!bookingId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Booking Details</DialogTitle>
            {booking && (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold mr-8 ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            )}
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
            Error loading booking details.
          </div>
        )}

        {booking && (
          <div className="grid gap-6 mt-4">
            {/* Header info */}
            <div className="flex flex-col gap-1 text-sm text-gray-500">
              <p>Booking ID: <span className="font-mono text-gray-900 dark:text-gray-100">{booking.id}</span></p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created {booking.createdAt ? format(new Date(booking.createdAt), 'PPP p') : '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Box */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <User className="h-5 w-5 text-teal-600" /> Customer
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getName((booking as any).customer?.name || booking.owner?.name) || 'Unknown User'}
                  </p>
                  <p>{(booking as any).customer?.email || booking.owner?.email || 'No email'}</p>
                  <p>{(booking as any).customer?.phone || booking.owner?.phone || 'No phone'}</p>
                </div>
              </div>

              {/* Provider Box */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-teal-600" /> Provider
                </h3>
                {booking.provider ? (
                   <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                     <p className="font-medium text-gray-900 dark:text-white">
                       {getName(booking.provider.businessName) || getName(booking.provider.user?.name) || 'Unknown Provider'}
                     </p>
                     <p>{(booking.provider as any).email || (booking.provider.user as any)?.email || 'No email'}</p>
                     <p>{booking.provider.phone || (booking.provider.user as any)?.phone || 'No phone'}</p>
                   </div>
                ) : (
                   <p className="text-sm text-gray-500 italic">No provider assigned yet.</p>
                )}
              </div>
            </div>

            {/* Service & Pricing */}
            <div className="rounded-xl border border-gray-100 p-4 shadow-sm dark:border-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100 text-lg">Service Information</h3>
              <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{getName(booking.service?.name) || 'Unknown Service'}</p>
                  { (booking as any).description && <p className="text-sm text-gray-500 mt-1">{(booking as any).description}</p> }
                  { (booking as any).selected_attributes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Options:</strong>
                      <pre className="mt-1 bg-gray-100 p-2 rounded text-xs dark:bg-gray-800 text-wrap whitespace-pre-wrap">
                        {typeof (booking as any).selected_attributes === 'string' ? (booking as any).selected_attributes : JSON.stringify((booking as any).selected_attributes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Agreed Price</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {(booking as any).final_agreed_price != null 
                       ? Number((booking as any).final_agreed_price).toFixed(2) 
                       : (booking.finalPrice != null ? Number(booking.finalPrice).toFixed(2) : '0.00')} <span className="text-sm font-normal">SAR</span>
                  </p>
                </div>
              </div>

              {/* Location & Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                 <div>
                   <h4 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 mb-2">
                     <Clock className="h-4 w-4" /> Schedule Date
                   </h4>
                   <p className="text-gray-600 dark:text-gray-400">
                     {booking.scheduledDate || (booking as any).scheduled_at ? format(new Date(booking.scheduledDate || (booking as any).scheduled_at), 'PPP p') : 'As Soon As Possible (ASAP)'}
                   </p>
                 </div>
                 
                 <div>
                   <h4 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 mb-2">
                     <CreditCard className="h-4 w-4" /> Payment Status
                   </h4>
                   <div className="flex items-center gap-2">
                     <span>{(booking as any).payment_method || 'PENDING'}</span>
                     {(booking as any).is_paid && (
                       <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Paid</span>
                     )}
                   </div>
                 </div>

                 {((booking as any).address_city || (booking as any).address_street) && (
                   <div className="md:col-span-2 mt-2">
                     <h4 className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 mb-2">
                       <MapPin className="h-4 w-4" /> Location
                     </h4>
                     <p className="text-gray-600 dark:text-gray-400">
                       {[(booking as any).address_building, (booking as any).address_street, (booking as any).address_area, (booking as any).address_city].filter(Boolean).join(', ')}
                     </p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
