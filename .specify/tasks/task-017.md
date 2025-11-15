---
id: task-017
title: "React Frontend: Dashboard & Reports Pages"
category: "Frontend"
priority: "P2"
estimated_hours: 12
---

## Task Overview

Implement dashboard and reporting pages for management insights and data visualization.

## Description

Build dashboard with metrics visualization and reporting pages with data export capability.

**Scope**:
- Create Dashboard page with metric cards
- Display cases by status (pie/bar chart)
- Display cases by service type (bar chart)
- Display coordinator workload
- Display recent cases list
- Create Reports page with report selection
- Implement report generation and display
- Add CSV export functionality
- Implement date range picker for reports
- Add loading and empty states

## Acceptance Criteria

- [ ] Dashboard page loads and displays all metrics
- [ ] Metric cards show correct values (active cases, avg duration, etc.)
- [ ] Status distribution chart displays correctly
- [ ] Service type distribution chart displays correctly
- [ ] Coordinator workload table shows staff and assignments
- [ ] Recent cases list shows last 10 cases
- [ ] Dashboard refreshes automatically or on demand
- [ ] Reports page allows selecting report type
- [ ] Date range picker allows selecting from/to dates
- [ ] Report table displays data with proper formatting
- [ ] CSV export downloads file with correct data
- [ ] Only authorized users can view (Case Manager+)
- [ ] Charts are responsive on mobile
- [ ] Component tests pass

## Inputs

- Dashboard API endpoints from backend
- Reporting requirements from spec
- Chart library (Chart.js or React-specific library)

## Outputs

- Dashboard page (`frontend/src/pages/DashboardPage.tsx`)
- Reports page (`frontend/src/pages/ReportsPage.tsx`)
- Metric card component (`frontend/src/components/MetricCard.tsx`)
- Chart components for visualization
- Date range picker component
- API hooks for dashboard/reports
- Component tests

## Dependencies

- Task-015 (Authentication Pages)
- Task-014 (Core UI Components)
- Task-011 (Reporting Backend)
- Task-012 (Dashboard Backend)

## Technical Notes

**Dashboard Metrics**:
- Active cases: Big number card
- Status distribution: Pie chart
- Service distribution: Bar chart
- Avg case duration: Number with trend
- This month vs last month: Comparison with % change
- Coordinator workload: Table with name, pending, active, completed counts
- Recent cases: Table with owner, pet, status, created date

**Chart Library Options**:
- Chart.js (lightweight, popular)
- React-vis (Uber's visualization)
- Recharts (React-specific, easy to use)
- Recommendation: Recharts for React projects

**Report Page Components**:
- Report type selector (dropdown)
- Date range picker (from_date, to_date)
- Generate button
- Report table (dynamic columns based on report type)
- Export CSV button
- Loading state during generation
- Empty state if no data

**Date Range Picker**:
- Calendar UI or date inputs
- Default to last 30 days
- Validation: from_date < to_date
- Options: Last 7 days, Last 30 days, This month, Custom range

**CSV Export**:
- Filename: `report-{type}-{from_date}-{to_date}.csv`
- Includes header row
- Proper escaping for special characters
- Date format: YYYY-MM-DD

**Dashboard Polling/Refresh**:
- Auto-refresh every 5 minutes (if data cached)
- Manual refresh button
- Show "last updated" timestamp
- Loading indicator during refresh

**Responsive Design**:
- Dashboard cards stack on mobile
- Charts resize to container
- Tables scroll horizontally on small screens
- Touch-friendly date picker

## Success Criteria

✓ Dashboard displays metrics correctly
✓ Charts render properly
✓ Reports generate and export correctly
✓ All UI responsive on different screen sizes
