import { ServerCrash } from 'lucide-react';
import { ErrorPageView } from './ErrorPageView';

export function Err500Page() {
  return (
    <ErrorPageView
      code={500}
      title="خطأ في الخادم"
      description="حدث خطأ غير متوقع. فريقنا يعمل على إصلاح المشكلة. يرجى المحاولة لاحقاً."
      icon={<ServerCrash />}
    />
  );
}
