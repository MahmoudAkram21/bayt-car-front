import type { RoleDetails } from '../services/adminUsers.service';
export type PermissionModuleKey = 'DASHBOARD' | 'USERS' | 'SYSTEM_USERS' | 'PROVIDERS' | 'SERVICES' | 'SERVICE_REQUESTS' | 'SUPPORT_TICKETS' | 'COMMISSIONS' | 'WALLETS' | 'INVOICES' | 'REPORTS' | 'LOYALTY' | 'PROMOS' | 'COMMISSION_RULES' | 'TAX' | 'BANNERS' | 'SPLASH' | 'SETTINGS' | 'ORDERS';
export type PermissionActionKey = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'REPLY';
export declare function hasPermission(role: RoleDetails | undefined, module: PermissionModuleKey, action: PermissionActionKey): boolean;
