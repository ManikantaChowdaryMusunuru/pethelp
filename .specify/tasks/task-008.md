---
id: task-008
title: "Service Assignment & Coordination"
category: "Case Management"
priority: "P2"
estimated_hours: 8
---

## Task Overview

Implement service assignment functionality to track and coordinate services across teams (medical, boarding, behavioral).

## Description

Create endpoints and services for assigning cases to service coordinators and tracking service progress through completion.

**Scope**:
- Implement POST /api/cases/:id/services (assign service)
- Implement GET /api/cases/:id/services (list assignments)
- Implement PUT /api/cases/:id/services/:id (update status)
- Implement DELETE /api/cases/:id/services/:id (cancel assignment)
- Create ServiceAssignment entity
- Implement service status tracking (Assigned → In Progress → Complete)
- Add service coordinator assignment
- Track service completion dates
- Create ServiceAssignmentService

## Acceptance Criteria

- [ ] POST /api/cases/:id/services assigns service to case and coordinator
- [ ] Service types: Medical, Boarding, Behavioral, Food
- [ ] Coordinator must have matching service coordinator role
- [ ] Initial status is "Assigned"
- [ ] GET /api/cases/:id/services returns all assignments for case
- [ ] PUT /api/cases/:id/services/:id updates status
- [ ] Valid status transitions: Assigned → In Progress → Complete
- [ ] Completed_at timestamp automatically set when status="Complete"
- [ ] Cannot delete non-existent assignment
- [ ] DELETE /api/cases/:id/services/:id cancels assignment
- [ ] Service assignments appear in case history
- [ ] Integration tests verify workflow

## Inputs

- Service coordination requirements from spec
- Service types and coordinator roles

## Outputs

- Service assignment controller
- Service assignment service
- Integration tests

## Dependencies

- Task-004 (Case CRUD)
- Task-005 (Owner/Pet Management)
- Task-003 (Authentication)

## Technical Notes

**Service Assignment Workflow**:
```
Case Manager assigns Medical service
            ↓
ServiceAssignment created with status="Assigned"
            ↓
Medical Coordinator sees assignment in their workload
            ↓
Medical Coordinator marks status="In Progress"
            ↓
Medical work completed
            ↓
Medical Coordinator marks status="Complete"
            ↓
completed_at timestamp set
            ↓
Case Manager sees all services for case are complete
```

**Coordinator Workload Query**:
```sql
SELECT 
  sa.assigned_to,
  COUNT(*) as total_assignments,
  COUNT(CASE WHEN sa.status = 'Assigned' THEN 1 END) as pending,
  COUNT(CASE WHEN sa.status = 'In Progress' THEN 1 END) as active,
  COUNT(CASE WHEN sa.status = 'Complete' THEN 1 END) as completed
FROM service_assignments sa
WHERE sa.assigned_to = ?
GROUP BY sa.assigned_to
```

## Success Criteria

✓ Services can be assigned to coordinators
✓ Status transitions work correctly
✓ Service completion is tracked
✓ Workload visibility available
