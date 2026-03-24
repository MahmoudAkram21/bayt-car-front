import type { PermissionOption, RoleDetails } from '../services/adminUsers.service';

export type PermissionModuleKey =
  | 'DASHBOARD'
  | 'USERS'
  | 'SYSTEM_USERS'
  | 'PROVIDERS'
  | 'SERVICES'
  | 'SERVICE_REQUESTS'
  | 'SUPPORT_TICKETS'
  | 'COMMISSIONS'
  | 'WALLETS'
  | 'INVOICES'
  | 'REPORTS'
  | 'LOYALTY'
  | 'PROMOS'
  | 'COMMISSION_RULES'
  | 'TAX'
  | 'BANNERS'
  | 'SPLASH'
  | 'SETTINGS'
  | 'ORDERS';

export type PermissionActionKey = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'REPLY';

const SLUG_PREFIX_TO_MODULE: Record<string, PermissionModuleKey> = {
  users: 'USERS',
  providers: 'PROVIDERS',
  services: 'SERVICES',
  requests: 'SERVICE_REQUESTS',
  support_tickets: 'SUPPORT_TICKETS',
  finance: 'WALLETS',
  reports: 'REPORTS',
  settings: 'SETTINGS',
  roles: 'SYSTEM_USERS',
  banners: 'BANNERS',
};

function normalizeModule(permission: PermissionOption): string {
  if (permission.module) return permission.module.toUpperCase();
  const prefix = permission.slug.split('.')[0]?.toLowerCase();
  if (!prefix) return 'UNKNOWN';
  return (SLUG_PREFIX_TO_MODULE[prefix] ?? prefix.replace(/-/g, '_')).toUpperCase();
}

function normalizeAction(permission: PermissionOption): string {
  if (permission.action) return permission.action.toUpperCase();
  return (permission.slug.split('.')[1] ?? 'READ').toUpperCase();
}

function getLegacyModulesFromSlugPrefix(prefix: string): PermissionModuleKey[] {
  const map: Record<string, PermissionModuleKey[]> = {
    users: ['USERS', 'SYSTEM_USERS'],
    providers: ['PROVIDERS'],
    services: ['SERVICES'],
    requests: ['SERVICE_REQUESTS'],
    support_tickets: ['SUPPORT_TICKETS'],
    finance: ['WALLETS', 'COMMISSIONS', 'INVOICES', 'DASHBOARD'],
    reports: ['REPORTS', 'DASHBOARD'],
    settings: ['SETTINGS'],
    roles: ['SYSTEM_USERS', 'ROLES'],
    banners: ['BANNERS'],
  };
  return map[prefix] ?? [];
}

function getLegacyActionsFromSlugVerb(verb: string): PermissionActionKey[] {
  const map: Record<string, PermissionActionKey[]> = {
    view: ['READ'],
    manage: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    verify: ['UPDATE'],
    suspend: ['UPDATE'],
    generate: ['CREATE', 'READ'],
    create: ['CREATE'],
    read: ['READ'],
    update: ['UPDATE'],
    delete: ['DELETE'],
    reply: ['REPLY'],
  };
  return map[verb] ?? [];
}

function hasLegacyPermissionMatch(
  permission: PermissionOption,
  module: PermissionModuleKey,
  action: PermissionActionKey
): boolean {
  const [prefixRaw, verbRaw] = permission.slug.split('.');
  const prefix = (prefixRaw ?? '').toLowerCase();
  const verb = (verbRaw ?? '').toLowerCase();
  if (!prefix || !verb) return false;
  const allowedModules = getLegacyModulesFromSlugPrefix(prefix);
  const allowedActions = getLegacyActionsFromSlugVerb(verb);
  return allowedModules.includes(module) && allowedActions.includes(action);
}

export function hasPermission(
  role: RoleDetails | undefined,
  module: PermissionModuleKey,
  action: PermissionActionKey
): boolean {
  if (!role) return false;
  if (role.name === 'SUPER_ADMIN') return true;
  return role.permissions.some((permission) => {
    const isDirectMatch =
      normalizeModule(permission) === module && normalizeAction(permission) === action;
    if (isDirectMatch) return true;
    return hasLegacyPermissionMatch(permission, module, action);
  });
}

