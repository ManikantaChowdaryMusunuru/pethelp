---
id: task-012
title: "Dashboard & Real-time Metrics"
category: "Reporting"
priority: "P2"
estimated_hours: 8
---

## Task Overview

Implement real-time dashboard displaying key performance metrics for management oversight.

## Description

Create dashboard API endpoint that aggregates and returns key metrics for display in dashboard UI.

**Scope**:
- Implement GET /api/dashboard/metrics (dashboard data)
- Calculate total active cases
- Calculate cases by status distribution
- Calculate cases by service type distribution
- Calculate average case duration
- Show this month vs last month comparison
- Show service coordinator workload
- Show recent cases (last 10)
- Implement data refresh (5-minute cache)
- Create dashboard queries

## Acceptance Criteria

- [ ] GET /api/dashboard/metrics returns JSON with all dashboard data
- [ ] Total active cases count (status != Closed, not archived)
- [ ] Cases by status: counts for New, In Progress, On Hold, Closed
- [ ] Cases by service type: counts for Food, Medical, Boarding, Behavioral, Multiple
- [ ] Average case duration: days from created_at to closed_at (or current if open)
- [ ] This month vs last month: comparison with % change
- [ ] Coordinator workload: list of coordinators with assigned case counts
- [ ] Recent cases: last 10 created cases with basic info
- [ ] Metrics refreshed every 5 minutes (cached)
- [ ] Only authorized users (Case Manager, Admin, Director) can view
- [ ] Integration tests verify dashboard data

## Inputs

- Dashboard requirements from spec and user stories
- UI mockups and metric requirements

## Outputs

- Dashboard controller (`backend/src/controllers/dashboard.controller.ts`)
- Dashboard service (`backend/src/services/dashboard.service.ts`)
- Dashboard queries (`backend/src/repositories/dashboard.repository.ts`)
- Integration tests

## Dependencies

- Task-004 (Case CRUD)
- Task-008 (Service Assignment)

## Technical Notes

**Dashboard Query** (aggregate all metrics):
```sql
SELECT 
  COUNT(CASE WHEN c.status != 'Closed' AND c.is_archived = false THEN 1 END) as active_cases,
  COUNT(CASE WHEN c.status = 'New' THEN 1 END) as status_new,
  COUNT(CASE WHEN c.status = 'In Progress' THEN 1 END) as status_in_progress,
  COUNT(CASE WHEN c.status = 'On Hold' THEN 1 END) as status_on_hold,
  COUNT(CASE WHEN c.status = 'Closed' THEN 1 END) as status_closed,
  AVG(EXTRACT(EPOCH FROM (COALESCE(c.closed_at, NOW()) - c.created_at))/86400) as avg_duration_days
FROM cases c
WHERE c.is_archived = false
```

**Service Distribution**:
```sql
SELECT service_type, COUNT(*) as count
FROM cases
WHERE is_archived = false AND status != 'Closed'
GROUP BY service_type
```

**Coordinator Workload**:
```sql
SELECT 
  u.user_id,
  u.name,
  COUNT(CASE WHEN sa.status = 'Assigned' THEN 1 END) as pending,
  COUNT(CASE WHEN sa.status = 'In Progress' THEN 1 END) as active,
  COUNT(CASE WHEN sa.status = 'Complete' THEN 1 END) as completed
FROM users u
LEFT JOIN service_assignments sa ON u.user_id = sa.assigned_to
WHERE u.role = 'Service Coordinator'
GROUP BY u.user_id, u.name
```

**Recent Cases**:
```sql
SELECT c.case_id, o.name as owner_name, p.name as pet_name, 
       c.service_type, c.status, c.created_at
FROM cases c
JOIN owners o ON c.owner_id = o.owner_id
LEFT JOIN pets p ON c.pet_id = p.pet_id
WHERE c.is_archived = false
ORDER BY c.created_at DESC
LIMIT 10
```

**Dashboard Data Structure**:
```json
{
  "summary": {
    "active_cases": 42,
    "total_cases": 287,
    "avg_case_duration_days": 18
  },
  "status_distribution": {
    "New": 5,
    "In Progress": 28,
    "On Hold": 7,
    "Closed": 247
  },
  "service_distribution": {
    "Food": 15,
    "Medical": 18,
    "Boarding": 6,
    "Behavioral": 2,
    "Multiple": 1
  },
  "comparison": {
    "this_month_cases": 28,
    "last_month_cases": 32,
    "percent_change": -12.5
  },
  "coordinator_workload": [
    { "name": "Jane Smith", "pending": 2, "active": 5, "completed": 15 },
    { "name": "Bob Jones", "pending": 1, "active": 3, "completed": 12 }
  ],
  "recent_cases": [
    { "case_id": "123", "owner_name": "John Doe", "pet_name": "Fluffy", 
      "service_type": "Medical", "status": "In Progress", "created_at": "2025-11-15" }
  ]
}
```

**Caching**:
- Cache full dashboard response for 5 minutes
- Invalidate on case/service changes
- Provide manual refresh endpoint

## Success Criteria

✓ Dashboard data aggregates correctly
✓ Metrics are accurate
✓ Performance is acceptable (< 500ms)
✓ Cache improves performance
