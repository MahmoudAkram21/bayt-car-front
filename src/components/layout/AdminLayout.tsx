import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar — Design System: w-64, white/dark:gray-800, RTL support via dir */}
      <Sidebar />

      {/* Main Content — Design System: lg:ml-64 (LTR), padding, overflow */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Header — Design System: sticky, z-20, h-14 sm:h-16 */}
        <Header />

        {/* Content Area — Design System: bg-gray-50 dark:bg-gray-900, p-3 sm:p-4 md:p-6 lg:p-8 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
