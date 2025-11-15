---
id: task-011
title: "Reporting Engine & Reports API"
category: "Reporting"
priority: "P2"
estimated_hours: 12
---

## Task Overview

Implement comprehensive reporting system with multiple report types and export capabilities.

## Description

Build reporting engine that generates business intelligence reports for management decision-making.

**Scope**:
- Implement GET /api/reports/case-volume (case volume by period, status, service)
- Implement GET /api/reports/service-utilization (service metrics)
- Implement GET /api/reports/case-outcomes (outcome statistics)
- Implement GET /api/reports/staff-activity (staff performance)
- Implement POST /api/reports/export (export to CSV)
- Create ReportService with report generation logic
- Support date range filtering
- Implement report caching
- Add report scheduling (future: background jobs)
- Create report templates

## Acceptance Criteria

- [ ] GET /api/reports/case-volume returns cases by month, status, service_type
- [ ] Report data aggregates correctly (no double-counting)
- [ ] GET /api/reports/service-utilization shows services served, unique owners, resolution time
- [ ] GET /api/reports/case-outcomes shows owner case history and resolution rates
- [ ] GET /api/reports/staff-activity shows staff cases handled, avg duration, unique owners
- [ ] Date range filtering: from_date, to_date query parameters
- [ ] All reports support date range filtering
- [ ] CSV export includes all report data with headers
- [ ] CSV file downloads with proper filename and timestamp
- [ ] Report generation completes in < 5 minutes for any date range
- [ ] Reports are cached for 1 hour (can be refreshed manually)
- [ ] Only authorized users (Case Manager, Admin, Director) can view reports
- [ ] Integration tests verify report accuracy

## Inputs

- Reporting requirements from spec
- Reporting use cases from user stories

## Outputs

- Report controller (`backend/src/controllers/reports.controller.ts`)
- Report service (`backend/src/services/reports.service.ts`)
- Report queries (`backend/src/repositories/reports.repository.ts`)
- CSV export utilities
- Integration tests

## Dependencies

- Task-004 (Case CRUD)
- Task-008 (Service Assignment)

## Technical Notes

**Report Types & Queries**:

**1. Case Volume Report**:
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_cases,
  status,
  service_type
FROM cases
WHERE created_at >= ? AND created_at < ?
  AND is_archived = false
GROUP BY month, status, service_type
ORDER BY month DESC, status
```

**2. Service Utilization**:
```sql
SELECT 
  sa.service_type,
  COUNT(DISTINCT sa.case_id) as cases_served,
  COUNT(DISTINCT c.owner_id) as unique_owners,
  AVG(EXTRACT(EPOCH FROM (sa.completed_at - sa.created_at))/86400) as avg_days
FROM service_assignments sa
JOIN cases c ON sa.case_id = c.case_id
WHERE sa.created_at >= ? AND sa.created_at < ?
  AND sa.status = 'Complete'
GROUP BY sa.service_type
```

**3. Case Outcomes**:
```sql
SELECT 
  c.owner_id,
  COUNT(*) as total_cases,
  COUNT(CASE WHEN c.status = 'Closed' THEN 1 END) as resolved_cases,
  MAX(c.closed_at) as most_recent_closure
FROM cases c
WHERE c.created_at >= ? AND c.created_at < ?
GROUP BY c.owner_id
ORDER BY total_cases DESC
```

**4. Staff Activity**:
```sql
SELECT 
  c.assigned_to,
  u.name as staff_name,
  COUNT(*) as cases_handled,
  AVG(EXTRACT(EPOCH FROM (c.updated_at - c.created_at))/86400) as avg_duration,
  COUNT(DISTINCT c.owner_id) as unique_owners
FROM cases c
JOIN users u ON c.assigned_to = u.user_id
WHERE c.created_at >= ? AND c.created_at < ?
GROUP BY c.assigned_to, u.name
```

**Caching Strategy**:
- Cache full report for 1 hour
- Invalidate cache on case/service changes
- Manual refresh option for users
- Use Redis for cache backend

**CSV Export Format**:
- Include headers
- Proper escaping for special characters
- Date format: YYYY-MM-DD
- Filename: `report-{type}-{from_date}-{to_date}.csv`

**Report Pagination**:
- Large reports paginated (10,000 rows per page)
- Implement cursor-based pagination for efficiency

## Success Criteria

✓ Reports generate correctly
✓ Data is accurate and complete
✓ CSV exports are properly formatted
✓ Performance meets targets (< 5 minutes)
