/** Main-process permissions — re-exports shared RBAC helpers. */
export {
  PERMISSION_KEYS,
  PERMISSION_LABELS,
  defaultsForRole,
  normalizePermissions,
  parsePermissions,
  serializePermissions,
  hasPermission,
} from '../../shared/permissions.js';
