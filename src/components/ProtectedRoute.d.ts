import { UserRole } from '../types';
interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}
export declare const ProtectedRoute: ({ children, allowedRoles }: ProtectedRouteProps) => import("react/jsx-runtime").JSX.Element;
export {};
