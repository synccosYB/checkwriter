export const AUDIT_ACTIONS = {
  Created: 'Created',
  Updated: 'Updated',
  Deleted: 'Deleted',
} as const;

export const AUDIT_ENTITY_TYPES = {
  checks: 'checks',
  payees: 'payees',
  banks: 'banks',
  tags: 'tags',
  usersSubscriptions: 'usersSubscriptions',
} as const;

export type AuditAction = keyof typeof AUDIT_ACTIONS; 
export type AuditEntityType = keyof typeof AUDIT_ENTITY_TYPES;
