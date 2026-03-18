import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardFooter } from './DashboardFooter';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        {/* Background Mesh Gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 -right-4 w-96 h-96 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

      {/* Sidebar — Design System: w-72, white/dark:gray-800, RTL support via dir */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content — Design System: lg:ml-72 (LTR), padding, overflow */}
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden relative z-10 transition-all duration-300",
        isCollapsed ? "lg:ms-20" : "lg:ms-72"
      )}>
        {/* Header — Design System: sticky, z-20, h-14 sm:h-16 */}
        <Header />

        {/* Content Area — Design System: bg-transparent (layout handles bg), p-4 sm:p-6 lg:p-8 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};
