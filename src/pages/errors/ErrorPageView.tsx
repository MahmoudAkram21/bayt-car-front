import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Home, ArrowLeft, AlertCircle, Ban, FileQuestion, ServerCrash } from 'lucide-react';

export type ErrorCode = 400 | 403 | 404 | 500;

interface ErrorPageViewProps {
  code: ErrorCode;
  title: string;
  description: string;
  icon: React.ReactNode;
  showLoginLink?: boolean;
}

export function ErrorPageView({ code, title, description, icon, showLoginLink }: ErrorPageViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16 dark:bg-gray-900">
      <div className="animate-fade-in w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 ring-4 ring-orange-200/50 dark:ring-orange-800/50">
            <span className="text-orange-600 dark:text-orange-400 [&_svg]:h-14 [&_svg]:w-14">
              {icon}
            </span>
          </div>
        </div>
        <p className="text-7xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
          {code}
        </p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl border-gray-300 dark:border-gray-600"
          >
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              رجوع
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg hover:from-orange-700 hover:to-orange-800"
          >
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="h-4 w-4" />
              الرئيسية
            </Link>
          </Button>
          {showLoginLink && (
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-xl"
            >
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
