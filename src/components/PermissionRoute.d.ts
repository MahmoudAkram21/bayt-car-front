import type { PermissionActionKey, PermissionModuleKey } from '../lib/rbac';
interface PermissionRouteProps {
    module: PermissionModuleKey;
    action?: PermissionActionKey;
    children: React.ReactNode;
}
export declare const PermissionRoute: ({ module, action, children }: PermissionRouteProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
