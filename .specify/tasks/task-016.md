---
id: task-016
title: "React Frontend: Case Management Pages"
category: "Frontend"
priority: "P1"
estimated_hours: 16
---

## Task Overview

Implement case list, case detail, and case creation/editing pages in React.

## Description

Build the main case management interface with list view, detail view, and form-based creation/editing.

**Scope**:
- Create Cases list page with filtering and search
- Create Case detail page with full case info
- Create Case creation form
- Create Case edit form
- Implement case status change workflow
- Add file upload and display in case view
- Add case notes creation and display
- Implement service assignment assignment in case UI
- Add loading and error states
- Create integration with case API endpoints

## Acceptance Criteria

- [ ] Cases list page displays all accessible cases
- [ ] Filtering by status, service type, assigned staff works
- [ ] Search by owner name/phone/case ID works
- [ ] Pagination works (20 cases per page)
- [ ] Clicking case opens detail page
- [ ] Case detail shows all fields and relationships
- [ ] Case detail shows notes with timestamps
- [ ] Case detail shows files with preview ability
- [ ] Case detail shows service assignments
- [ ] Edit case button updates case fields
- [ ] Status dropdown enforces valid transitions
- [ ] Create case form validates required fields
- [ ] File upload works in case detail
- [ ] New note can be added in case detail
- [ ] All API calls use auth token
- [ ] Component tests pass

## Inputs

- Case API endpoints from backend
- Case management requirements from spec
- User stories for case workflows

## Outputs

- Cases list page (`frontend/src/pages/CasesPage.tsx`)
- Case detail page (`frontend/src/pages/CaseDetailPage.tsx`)
- Case form component (`frontend/src/components/CaseForm.tsx`)
- Cases table component (`frontend/src/components/CasesTable.tsx`)
- Case notes component (`frontend/src/components/CaseNotes.tsx`)
- Case files component (`frontend/src/components/CaseFiles.tsx`)
- Services assignments component (`frontend/src/components/ServiceAssignments.tsx`)
- API hooks (`frontend/src/hooks/useCases.ts`)
- Component tests

## Dependencies

- Task-015 (Authentication Pages)
- Task-014 (Core UI Components)
- Task-004 (Case CRUD Backend)

## Technical Notes

**Case List View**:
- Table with: Case ID, Owner, Pet, Status, Service Type, Assigned To, Created Date
- Sortable columns
- Pagination
- Filter sidebar: Status, Service Type, Assigned To, Date Range
- Search box (global search across fields)
- Bulk actions (future: bulk status update)

**Case Detail View**:
- Owner info card
- Pet info card
- Case info card (status, service type, dates)
- Notes section (list + add form)
- Files section (list + upload)
- Service assignments section
- Edit button to edit case

**Case Form**:
- Required: Owner ID, Service Type
- Optional: Pet ID, Notes
- Dynamic owner selection (search/autocomplete)
- Dynamic pet selection (filtered by owner)
- Service type: dropdown with predefined options
- Submit and Cancel buttons
- Validation on form fields
- Error display

**File Upload in Case Detail**:
- Drag-and-drop area
- File picker button
- Upload progress
- File list with preview links
- Delete button for files

**Notes Display**:
- Note text
- Creator name and date
- Edit/delete buttons (if created by current user)
- Chronological order (newest first or oldest first)
- Add note form at top or bottom

**API Hooks** (React Query or SWR):
```typescript
const useCases = (filters?: CaseFilters) => {
  return useQuery('cases', () => api.get('/api/cases', { params: filters }));
};

const useCase = (caseId: string) => {
  return useQuery(['case', caseId], () => api.get(`/api/cases/${caseId}`));
};

const useCreateCase = () => {
  return useMutation((data) => api.post('/api/cases', data));
};
```

**State Management**:
- User filters stored in URL query params (persistent)
- Case data cached with React Query
- Form state with React Hook Form
- Global auth state in Auth Context

## Success Criteria

✓ Cases list displays all cases correctly
✓ Filtering and search work
✓ Case detail shows all information
✓ CRUD operations work via API
✓ User interactions are smooth
