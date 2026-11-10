export type AuditEventType =
  | "USER_LOGIN"
  | "ORDER_CREATED"
  | "ORDER_STATUS_CHANGED"
  | "ORDER_DELETED"
  | "PRODUCT_CREATED"
  | "PRODUCT_STATUS_CHANGED"
  | "DATA_EXPORTED"
  | "SETTINGS_SAVED"
  | "DATA_RESET"
  | "API_KEY_CREATED"
  | "API_KEY_REVOKED"
  | "TEAM_MEMBER_PROVISIONED"
  | "TEAM_MEMBER_DEACTIVATED"
  | "PROFILE_UPDATED"
  | "PASSWORD_CHANGED"
  | "LEDGER_RESYNC";

export interface AuditLogEntry {
  id: string;
  type: AuditEventType;
  description: string;
  actor: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "audit-01",
    type: "USER_LOGIN",
    description: "Session authenticated via Fixentra Security Gate",
    actor: "ardfrmn",
    timestamp: "Just now",
  },
  {
    id: "audit-02",
    type: "ORDER_CREATED",
    description: "Recorded Enterprise Annual License ($1,999.00)",
    actor: "ardfrmn",
    timestamp: "10m ago",
  },
  {
    id: "audit-03",
    type: "DATA_EXPORTED",
    description: "Exported transaction registry in CSV format",
    actor: "ardfrmn",
    timestamp: "25m ago",
  },
  {
    id: "audit-04",
    type: "SETTINGS_SAVED",
    description: "Updated workspace regional standards & alerts",
    actor: "ardfrmn",
    timestamp: "1h ago",
  },
];

export function createAuditEntry(
  type: AuditEventType,
  description: string,
  actor = "ardfrmn",
  meta?: Record<string, unknown>
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}`,
    type,
    description,
    actor,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    meta,
  };
}
