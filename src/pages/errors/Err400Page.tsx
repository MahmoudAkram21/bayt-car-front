import { AlertCircle } from 'lucide-react';
import { ErrorPageView } from './ErrorPageView';

export function Err400Page() {
  return (
    <ErrorPageView
      code={400}
      title="طلب غير صالح"
      description="البيانات المرسلة غير صحيحة أو ناقصة. يرجى التحقق من المدخلات والمحاولة مرة أخرى."
      icon={<AlertCircle />}
    />
  );
}
