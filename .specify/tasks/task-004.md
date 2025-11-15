---
id: task-004
title: "Case CRUD Operations & Endpoints"
category: "Case Management"
priority: "P1"
estimated_hours: 12
---

## Task Overview

Implement complete CRUD operations for case management including API endpoints and business logic.

## Description

Create the core case management functionality with full create, read, update, delete operations, along with case status tracking and history.

**Scope**:
- Implement GET /api/cases (list with filtering, pagination)
- Implement POST /api/cases (create new case)
- Implement GET /api/cases/:id (get case detail)
- Implement PUT /api/cases/:id (update case)
- Implement DELETE /api/cases/:id (soft delete/archive)
- Implement POST /api/cases/:id/restore (restore archived)
- Implement GET /api/cases/:id/history (case change history)
- Create CaseService with business logic
- Implement case status validation
- Implement soft delete with is_archived flag
- Add audit logging for all changes
- Create integration tests for all endpoints

## Acceptance Criteria

- [ ] GET /api/cases returns paginated list of cases
- [ ] GET /api/cases supports filtering by status, service_type, assigned_to, date_range
- [ ] POST /api/cases creates case with owner_id, pet_id, service_type required
- [ ] Case is created with status='New' and current timestamp
- [ ] GET /api/cases/:id returns complete case with relationships
- [ ] PUT /api/cases/:id updates case fields and triggers audit log
- [ ] Cannot update status to invalid value (only New/In Progress/On Hold/Closed/Archived)
- [ ] DELETE /api/cases/:id sets is_archived=true (soft delete)
- [ ] Archived cases do not appear in default list
- [ ] GET /api/cases/:id/history returns all status changes with timestamps
- [ ] POST /api/cases/:id/restore restores archived case
- [ ] All endpoints require authentication
- [ ] RBAC enforced: Staff cannot see other staff's cases, Case Manager sees all
- [ ] Integration tests verify all scenarios

## Inputs

- Case schema from `.specify/plan/main.md`
- API requirements from `.specify/spec/main.md`

## Outputs

- Case controller (`backend/src/controllers/cases.controller.ts`)
- Case service (`backend/src/services/cases.service.ts`)
- Case repository/queries (`backend/src/repositories/cases.repository.ts`)
- API route definitions (`backend/src/routes/cases.routes.ts`)
- Request/response DTOs (`backend/src/dtos/case.dto.ts`)
- Integration tests (`backend/tests/integration/cases.test.ts`)

## Dependencies

- Task-003 (Authentication)
- Task-002 (Database Schema)
- Task-001 (Project Structure)

## Technical Notes

**Case Status Transitions**:
```
New → In Progress → [On Hold] → Closed
                       ↓
                   In Progress
Closed → Archived (after 6 months, manual action)
```

**Filtering Examples**:
- GET /api/cases?status=In%20Progress&assigned_to=user-123
- GET /api/cases?created_from=2025-11-01&created_to=2025-11-30
- GET /api/cases?service_type=Medical,Food

**Pagination**:
- Default limit: 20
- Query parameters: page, limit, sort, sort_by
- Response includes: data, total, page, pages

**Soft Delete Strategy**:
- is_archived flag set to true
- Data never physically deleted (compliance)
- Archived cases still appear in history/audit
- Restore moves is_archived back to false

## Success Criteria

✓ All CRUD operations work end-to-end
✓ Case data persists across requests
✓ Filtering and pagination work correctly
✓ Soft delete preserves data
✓ Authorization prevents unauthorized access
