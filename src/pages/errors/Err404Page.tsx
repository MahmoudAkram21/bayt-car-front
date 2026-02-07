import { FileQuestion } from 'lucide-react';
import { ErrorPageView } from './ErrorPageView';

export function Err404Page() {
  return (
    <ErrorPageView
      code={404}
      title="الصفحة غير موجودة"
      description="لم نتمكن من العثور على الصفحة المطلوبة. ربما تم نقلها أو حذفها."
      icon={<FileQuestion />}
    />
  );
}
