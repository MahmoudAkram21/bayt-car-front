import { Ban } from 'lucide-react';
import { ErrorPageView } from './ErrorPageView';

export function Err403Page() {
  return (
    <ErrorPageView
      code={403}
      title="غير مصرح"
      description="ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى تسجيل الدخول بحساب له الصلاحيات المناسبة."
      icon={<Ban />}
      showLoginLink
    />
  );
}
