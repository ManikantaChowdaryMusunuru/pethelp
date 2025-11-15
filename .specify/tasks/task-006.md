---
id: task-006
title: "Case Notes & Audit Logging"
category: "Case Management"
priority: "P1"
estimated_hours: 8
---

## Task Overview

Implement case notes functionality and immutable audit logging for compliance and accountability.

## Description

Create endpoints for adding/editing case notes and establish comprehensive audit logging of all system changes for compliance and dispute resolution.

**Scope**:
- Implement POST /api/cases/:id/notes (add note)
- Implement GET /api/cases/:id/notes (list notes)
- Implement PUT /api/cases/:id/notes/:id (update note)
- Implement DELETE /api/cases/:id/notes/:id (delete note)
- Create AuditLog table and service
- Log all case changes to audit_logs table
- Log all user actions (create, update, delete)
- Implement GET /api/admin/audit-log (admin only)
- Add timestamps and user attribution to all changes
- Ensure audit logs are immutable

## Acceptance Criteria

- [ ] POST /api/cases/:case_id/notes creates note with text and timestamp
- [ ] Note creator is automatically captured from current user
- [ ] GET /api/cases/:case_id/notes returns all notes sorted by date
- [ ] PUT /api/cases/:case_id/notes/:id updates note text
- [ ] Note updates create new audit entry (not overwrite)
- [ ] DELETE /api/cases/:case_id/notes/:id marks note as archived (soft delete)
- [ ] All case status changes create audit_log entries
- [ ] All case field updates create audit_log entries with old/new values
- [ ] Audit log entry includes: entity_type, entity_id, action, changes, changed_by, changed_at
- [ ] GET /api/admin/audit-log returns all audit entries (admin only)
- [ ] Audit log entries cannot be deleted directly
- [ ] Audit queries return results in chronological order
- [ ] Integration tests verify audit trail is complete

## Inputs

- Audit log schema and requirements
- Note management requirements from spec

## Outputs

- Note controller (`backend/src/controllers/notes.controller.ts`)
- Note service (`backend/src/services/notes.service.ts`)
- Audit service (`backend/src/services/audit.service.ts`)
- Audit repository with queries
- Integration tests for notes and audit

## Dependencies

- Task-004 (Case CRUD)
- Task-003 (Authentication)
- Task-002 (Database Schema)

## Technical Notes

**Audit Log Entry Structure**:
```json
{
  "log_id": "uuid",
  "entity_type": "Case",
  "entity_id": "case-uuid",
  "action": "Update",
  "changes": {
    "status": { "old": "New", "new": "In Progress" },
    "assigned_to": { "old": null, "new": "user-123" }
  },
  "changed_by": "user-456",
  "changed_at": "2025-11-15T14:30:00Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Events to Log**:
- Case created
- Case status changed
- Case assigned to staff member
- Case archived/restored
- Note added/updated/deleted
- File uploaded/deleted
- Service assigned/completed
- User created/updated/deactivated

**Audit Service Methods**:
- `logCreate(entityType, entityId, createdBy, data)`
- `logUpdate(entityType, entityId, changedBy, changes)`
- `logDelete(entityType, entityId, deletedBy)`
- `logAction(entityType, entityId, action, changedBy, details)`
- `getAuditTrail(entityType, entityId)` - get all changes for entity

**Note Immutability Strategy**:
- Track note history: original text + all edits
- Show edited note with "edited at" timestamp
- Keep audit trail showing who made each change
- Cannot delete notes permanently (soft delete only)

## Success Criteria

✓ Notes can be created and edited
✓ Audit trail is complete and immutable
✓ All changes are properly logged
✓ Audit queries work for compliance reports
