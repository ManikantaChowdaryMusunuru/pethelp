# Feature Specification: Pet Help Center Case Management System (PHCS)

**Feature Branch**: `phcs-case-management`  
**Created**: 2025-11-15  
**Status**: Final  
**Organization**: Jacksonville Humane Society (JHS)

## Executive Summary

Jacksonville Humane Society (JHS) is a no-kill nonprofit that helps pet owners keep their pets through emergency services including food, medical care, boarding, and behavioral support. Currently, case management is fragmented across voicemail and WaitWhile systems, causing data silos, poor reporting, and inefficient case tracking. The Pet Help Center Case Management System (PHCS) will centralize all case data, enable comprehensive reporting, and provide staff with a unified interface for case management and decision-making.

## Client Summary

**Organization**: Jacksonville Humane Society (JHS)  
**Mission**: No-kill nonprofit providing emergency pet assistance services  
**Current Pain Points**:
- Two separate systems (voicemail + WaitWhile) create fragmented case records
- No centralized reporting or analytics
- Difficult to track case status and outcomes
- Poor visibility into service utilization and pet owner demographics
- Staff coordination is inefficient across channels

**Success Definition**: A unified web application that consolidates all case records, eliminates duplicate entry, provides actionable reporting dashboards, and streamlines staff workflows.

## Problem Background

### Current State
- **Voicemail System**: Initial intake via phone, creates fragmented records
- **WaitWhile System**: Separate queue/scheduling system, limited case history
- **Data Loss**: Case information scattered across systems with no unified view
- **Reporting Gap**: No comprehensive metrics on cases, outcomes, service load, or client demographics

### Impact
- Staff spends significant time manually consolidating information
- Management cannot generate reports on case volume, outcomes, or service effectiveness
- Decision-making lacks data-driven insights
- Scaling operations becomes increasingly difficult
- Client follow-up is inconsistent and error-prone

## Project Goal

Build a full-stack web application that:
1. **Centralizes** all case data into a single source of truth
2. **Automates** file ingestion from external systems (voicemail, forms, uploads)
3. **Enables** comprehensive CRUD operations with soft deletes for audit compliance
4. **Provides** real-time dashboards and reporting for management
5. **Secures** role-based access for staff and administrative users
6. **Scales** to support JHS growth and multi-site operations

## Users & Roles

### User Types

#### 1. Front-Line Staff (Intake)
- **Responsibilities**: Take intake calls, create new cases, log initial pet/owner information
- **Permissions**: Create cases, view own cases, access case files
- **Frequency**: Daily users, high volume of case creation
- **Pain Point**: Slow intake process, hard to find existing client records

#### 2. Case Managers
- **Responsibilities**: Manage case lifecycle, track interventions, update case status, coordinate services
- **Permissions**: Full CRUD on cases, access all case history, update status/notes
- **Frequency**: Daily users, medium-high case load
- **Pain Point**: Cannot see case history across systems, slow status updates

#### 3. Service Coordinators (Medical, Boarding, Behavioral)
- **Responsibilities**: Coordinate specific services within cases (medical appointments, boarding, etc.)
- **Permissions**: View assigned cases, update service-specific fields, add notes
- **Frequency**: Daily users, service-specific focus
- **Pain Point**: Fragmented service data, hard to coordinate with other teams

#### 4. Administrators
- **Responsibilities**: System configuration, user management, data integrity, reporting
- **Permissions**: Full system access, user CRUD, system settings, data exports
- **Frequency**: Occasional users, operational oversight
- **Pain Point**: No visibility into data quality or user activity

#### 5. Directors/Management
- **Responsibilities**: Strategic oversight, budget planning, service metrics
- **Permissions**: View dashboards, reports, aggregate metrics (read-only)
- **Frequency**: Weekly/monthly users, decision support
- **Pain Point**: Cannot answer questions about case volume, outcomes, service effectiveness

### Role Matrix

| Role | Create Case | Edit Case | Delete Case | View Reports | Manage Users | Export Data |
|------|-------------|-----------|------------|--------------|--------------|------------|
| Staff | ✓ | ✓ (own) | ✗ | ✗ | ✗ | ✗ |
| Case Manager | ✓ | ✓ (all) | ✗ | ✓ | ✗ | ✗ |
| Service Coordinator | ✗ | ✓ (service) | ✗ | ✓ (service) | ✗ | ✗ |
| Administrator | ✓ | ✓ | ✓ (soft) | ✓ | ✓ | ✓ |
| Director | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |

## User Scenarios & Testing

### User Story 1 - Intake Staff Creates New Case (Priority: P1)

**Scenario**: Staff member receives call from pet owner needing emergency food assistance. They need to quickly create a case record with owner and pet information.

**Why this priority**: Core MVP functionality. Enables intake workflow and data centralization. Blocks all other stories.

**Independent Test**: Can create a complete case via UI, case appears in list, all fields saved correctly.

**Acceptance Scenarios**:

1. **Given** staff is logged in to PHCS, **When** they click "New Case", **Then** a case creation form displays with all required fields
2. **Given** staff enters owner name, pet name, and service type, **When** they click "Save", **Then** case is created with unique ID and appears in case list
3. **Given** a case is created, **When** another staff member searches for the owner's name, **Then** existing case appears in search results
4. **Given** staff enters a duplicate phone number, **When** they submit the form, **Then** system alerts them to existing owner record and offers to link

---

### User Story 2 - Case Manager Updates Case Status & Notes (Priority: P1)

**Scenario**: Case manager receives a case from intake staff. They review the case, update status to "In Progress", add internal notes about the intervention plan.

**Why this priority**: Essential for case lifecycle management. Enables status tracking and coordination.

**Independent Test**: Can update case status, add notes, view complete case history with timestamps.

**Acceptance Scenarios**:

1. **Given** a case exists in "New" status, **When** case manager opens the case and changes status to "In Progress", **Then** status updates immediately and previous status is retained in history
2. **Given** case manager views a case, **When** they add a note to the notes field, **Then** note is saved with timestamp and staff member name
3. **Given** a case has multiple status changes, **When** case manager views case history, **Then** all previous statuses appear with dates in chronological order
4. **Given** case manager adds a note, **When** another staff member views the case, **Then** they see the new note with creator attribution

---

### User Story 3 - Upload & Preview Case Files (Priority: P1)

**Scenario**: Intake staff receives a completed intake form via email. They need to upload it to the case and preview it to verify it matches the case data.

**Why this priority**: Enables file ingestion workflow. Core data consolidation feature.

**Independent Test**: Can upload file, file appears in case, file preview displays correctly.

**Acceptance Scenarios**:

1. **Given** a case is open, **When** staff clicks "Upload File", **Then** file picker dialog appears
2. **Given** staff selects an image or PDF file, **When** upload completes, **Then** file appears in case's file list with upload date
3. **Given** a file is uploaded, **When** staff clicks file name, **Then** in-browser preview displays the file content
4. **Given** a file is uploaded, **When** staff views the file list, **Then** file type icon and file size display

---

### User Story 4 - Case Manager Assigns Service & Tracks Coordination (Priority: P2)

**Scenario**: Case manager determines pet needs emergency medical care. They need to assign case to medical coordinator and track the medical intervention.

**Why this priority**: Enables service coordination workflow. Supports multi-team case management.

**Independent Test**: Can assign service to coordinator, coordinator sees assigned case, status updates when service completes.

**Acceptance Scenarios**:

1. **Given** case manager opens a case, **When** they click "Assign Service" and select "Medical Care", **Then** medical coordinator role option appears in assignment dropdown
2. **Given** case manager assigns case to medical coordinator, **When** medical coordinator logs in, **Then** case appears in their "Assigned to Me" list
3. **Given** medical coordinator completes service, **When** they update the service status to "Complete", **Then** case manager is notified and case reflects service completion
4. **Given** a case has multiple services assigned, **When** case manager views the case, **Then** all services display with status and assigned coordinator

---

### User Story 5 - Staff Searches & Filters Cases (Priority: P2)

**Scenario**: Staff member receives follow-up call from pet owner. They need to quickly find the existing case by owner name or phone to provide updates.

**Why this priority**: Essential for usability and operational efficiency. Reduces case lookup time.

**Independent Test**: Can search by name/phone, results appear instantly, filters narrow results.

**Acceptance Scenarios**:

1. **Given** staff is on the case list, **When** they type owner name in search box, **Then** matching cases appear in real-time
2. **Given** staff searches by phone number, **When** search executes, **Then** exact or partial phone match cases appear
3. **Given** case list shows many cases, **When** staff filters by status "In Progress", **Then** list shows only active cases
4. **Given** staff filters by service type "Medical", **When** filter applies, **Then** only medical cases appear

---

### User Story 6 - Manager Views Case Dashboard & Reports (Priority: P2)

**Scenario**: Director needs to understand current case load, service distribution, and case outcomes for monthly board meeting.

**Why this priority**: Enables data-driven decision making. Supports reporting requirements.

**Independent Test**: Can view dashboard with case metrics, reports generate, data accuracy verified.

**Acceptance Scenarios**:

1. **Given** director logs into PHCS, **When** they navigate to Dashboard, **Then** key metrics display: total active cases, cases by service type, average case duration
2. **Given** dashboard displays case metrics, **When** director hovers over a metric, **Then** detail or definition appears
3. **Given** director clicks "Generate Report", **When** they select date range, **Then** report displays case data for that period with export option
4. **Given** report is generated, **When** director clicks "Export CSV", **Then** file downloads with all report data

---

### User Story 7 - Admin Manages Users & Permissions (Priority: P2)

**Scenario**: Director adds new intake staff member. Admin needs to create user account, assign role, grant access to case management features.

**Why this priority**: Enables system scaling and security. Required for operational growth.

**Independent Test**: Can create user, assign role, user can log in with correct permissions.

**Acceptance Scenarios**:

1. **Given** admin is in user management section, **When** they click "Add User", **Then** user creation form displays with name, email, role fields
2. **Given** admin creates user with "Intake Staff" role, **When** user logs in, **Then** they see intake permissions (create case) but not admin features
3. **Given** user is created, **When** admin views user list, **Then** user appears with status "Active" and assigned role
4. **Given** admin needs to deactivate user, **When** they click "Deactivate", **Then** user cannot log in but user record retained for audit

---

### User Story 8 - Soft Delete & Case Archival (Priority: P3)

**Scenario**: Case is resolved after 6 months. Admin wants to archive the case for record-keeping but keep data for compliance and future reference.

**Why this priority**: Enables record retention and compliance. Supports data governance.

**Independent Test**: Can mark case as archived, archived cases don't appear in active list, can search archived cases.

**Acceptance Scenarios**:

1. **Given** a case is in "Closed" status, **When** case manager clicks "Archive", **Then** case moves to archived state
2. **Given** case is archived, **When** staff views active case list, **Then** archived case does not appear
3. **Given** admin searches for archived case by name, **When** they include "Show Archived" in search, **Then** archived cases appear in results
4. **Given** case is archived, **When** admin audits data, **Then** all original data (notes, files, status history) is preserved

---

### User Story 9 - Data Ingestion from External System (Priority: P3)

**Scenario**: JHS has 500 existing cases in WaitWhile system. They need to import this historical data to PHCS during migration.

**Why this priority**: Enables data migration and system transition. Supports operational continuity.

**Independent Test**: Can import 500 cases, all fields map correctly, import can be verified and rolled back if needed.

**Acceptance Scenarios**:

1. **Given** admin is in system settings, **When** they click "Import Data", **Then** import configuration form displays
2. **Given** admin selects WaitWhile export file, **When** they click "Preview", **Then** sample of records displays with field mapping
3. **Given** admin confirms import mapping, **When** they click "Execute Import", **Then** import processes and progress bar displays
4. **Given** import completes, **When** admin views case list, **Then** all imported cases appear with source tracked

---

### User Story 10 - Case History & Audit Trail (Priority: P3)

**Scenario**: There's a question about when a case status changed or who made a particular note. Manager needs to view complete audit trail.

**Why this priority**: Supports compliance, accountability, and dispute resolution.

**Independent Test**: Can view case history with all changes, creator/timestamp for each change, history is immutable.

**Acceptance Scenarios**:

1. **Given** a case has been updated multiple times, **When** case manager clicks "View History", **Then** timeline displays all changes with dates and staff names
2. **Given** staff member views case history, **When** they click on a history entry, **Then** details display what changed and who changed it
3. **Given** case history shows a note, **When** case manager views the note, **Then** note creator and creation time display
4. **Given** audit is performed, **When** admin exports case history, **Then** all changes are recorded in export with immutable timestamps

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow intake staff to create a case with owner name, phone, email, pet name, breed, and service type
- **FR-002**: System MUST store case with unique ID and automatically assign creation timestamp
- **FR-003**: System MUST enable case managers to update case status (New, In Progress, On Hold, Closed, Archived)
- **FR-004**: System MUST retain complete status change history with timestamps and user attribution
- **FR-005**: System MUST allow file upload (PDF, images, documents) associated with cases
- **FR-006**: System MUST provide in-browser preview for uploaded files
- **FR-007**: System MUST support search by owner name, phone number, pet name, or case ID
- **FR-008**: System MUST enable filtering cases by status, service type, date range, and assigned staff
- **FR-009**: System MUST allow case managers to add/edit notes with timestamp and user attribution
- **FR-010**: System MUST track all note changes in audit history
- **FR-011**: System MUST allow assignment of cases to service coordinators (medical, boarding, behavioral)
- **FR-012**: System MUST track service status and coordinator assignments
- **FR-013**: System MUST provide dashboard with key metrics: active cases, cases by service, average duration
- **FR-014**: System MUST generate reports for date ranges with export to CSV
- **FR-015**: System MUST implement role-based access control (Intake Staff, Case Manager, Service Coordinator, Admin, Director)
- **FR-016**: System MUST enforce permissions: staff can only see own cases, case managers see all, admins see everything
- **FR-017**: System MUST support soft delete with case archival (no hard delete, preserve audit trail)
- **FR-018**: System MUST import historical case data from external systems with field mapping
- **FR-019**: System MUST maintain immutable audit trail of all case changes
- **FR-020**: System MUST support bulk case status updates for batch operations
- **FR-021**: System MUST validate all input data (required fields, phone format, email format)
- **FR-022**: System MUST handle file uploads up to 50MB per file
- **FR-023**: System MUST support concurrent user sessions without data conflicts
- **FR-024**: System MUST provide user activity logging for compliance and audit purposes

### Key Entities

- **Case**: Core record representing a single pet owner request for assistance
  - `case_id` (unique identifier)
  - `owner_id` (link to owner)
  - `pet_id` (link to pet)
  - `status` (New, In Progress, On Hold, Closed, Archived)
  - `service_type` (Food, Medical, Boarding, Behavioral, Multiple)
  - `created_at`, `updated_at`, `closed_at`
  - `assigned_to` (staff member)
  - `notes` (text field for case narrative)
  - `is_archived` (soft delete flag)

- **Owner**: Pet owner information
  - `owner_id` (unique identifier)
  - `name`, `phone`, `email`, `address`
  - `created_at`, `updated_at`

- **Pet**: Pet information
  - `pet_id` (unique identifier)
  - `owner_id` (link to owner)
  - `name`, `breed`, `age`, `color`, `health_notes`
  - `created_at`, `updated_at`

- **Service Assignment**: Track service coordination
  - `assignment_id` (unique identifier)
  - `case_id` (link to case)
  - `service_type` (Medical, Boarding, Behavioral, Food)
  - `assigned_to` (service coordinator)
  - `status` (Assigned, In Progress, Complete)
  - `created_at`, `completed_at`

- **Case File**: Uploaded documents
  - `file_id` (unique identifier)
  - `case_id` (link to case)
  - `filename`, `file_path`, `file_type`, `file_size`
  - `uploaded_by`, `uploaded_at`

- **Case Note**: Individual notes on case
  - `note_id` (unique identifier)
  - `case_id` (link to case)
  - `note_text`
  - `created_by`, `created_at`
  - `updated_by`, `updated_at`

- **User**: System users
  - `user_id` (unique identifier)
  - `email`, `name`, `phone`
  - `role` (Staff, Case Manager, Service Coordinator, Admin, Director)
  - `is_active`
  - `created_at`, `last_login_at`

- **Audit Log**: Immutable record of all changes
  - `log_id` (unique identifier)
  - `entity_type` (Case, Note, ServiceAssignment, etc.)
  - `entity_id`, `action` (Create, Update, Delete)
  - `changes` (JSON of what changed)
  - `changed_by`, `changed_at`

## Success Criteria

### Measurable Outcomes

- **SC-001**: Intake time reduced from 10 minutes (manual) to 3 minutes (system) per new case
- **SC-002**: Case lookup time reduced from 5 minutes to 30 seconds via search functionality
- **SC-003**: 100% of cases centralized in PHCS within 3 months (no duplicate data entry)
- **SC-004**: Management can generate monthly reports in under 5 minutes (currently requires manual compilation)
- **SC-005**: User adoption rate of 95%+ within 2 months (all staff actively using system)
- **SC-006**: Data accuracy rate of 99%+ (automated validation catches input errors)
- **SC-007**: System uptime of 99.5%+ (maximum 3.6 hours downtime per month)
- **SC-008**: Page load time under 2 seconds for 95% of requests (p95 < 2s)
- **SC-009**: Support ticket resolution for PHCS under 4 hours average
- **SC-010**: Cost per case managed reduced by 40% due to efficiency gains

### User Satisfaction Metrics

- **SC-011**: 90% of staff report system is "easier to use" than previous process (survey)
- **SC-012**: 85% of management report dashboards are "useful for decision-making" (survey)
- **SC-013**: 95% of staff feel they have "full visibility" into case status (survey)

### Operational Metrics

- **SC-014**: Case resolution time reduced from 45 days average to 30 days average
- **SC-015**: Service coordination time (medical/boarding) reduced by 50%
- **SC-016**: Duplicate case creation rate reduced to zero (previously 15%)

## Constraints

### Technical Constraints
- **CT-001**: Must be deployable on standard cloud infrastructure (AWS, GCP, Azure)
- **CT-002**: Must support concurrent users (minimum 50, target 200+)
- **CT-003**: Must comply with data privacy regulations (CCPA, GDPR if applicable)
- **CT-004**: Must support backup/restore for disaster recovery
- **CT-005**: Must provide audit logging for compliance

### Operational Constraints
- **CT-006**: JHS has limited IT staff (1 FTE) - system must be operationally simple
- **CT-007**: Budget limited - prefer open-source where possible
- **CT-008**: Migration must complete within 2-week window (data transition)
- **CT-009**: No downtime during migration (parallel systems supported)
- **CT-010**: Staff training must be completable in 4 hours per person

### Business Constraints
- **CT-011**: Must preserve all historical case data (5+ years)
- **CT-012**: Must support future expansion to multiple JHS locations
- **CT-013**: Must integrate with existing phone system for intake (future phase)
- **CT-014**: Must be licensed/configured for JHS nonprofit status if applicable

## Non-Functional Requirements

### Performance
- **NFR-001**: Page load time < 2 seconds (p95)
- **NFR-002**: Search results return within 1 second for typical queries
- **NFR-003**: Report generation completes within 5 minutes for any date range
- **NFR-004**: System supports 100 concurrent users without degradation

### Security
- **NFR-005**: All user passwords must be hashed (bcrypt minimum)
- **NFR-006**: All API calls must be authenticated with JWT or session tokens
- **NFR-007**: Sensitive data (SSN, medical notes) must be encrypted at rest
- **NFR-008**: All data transmission must use HTTPS
- **NFR-009**: Role-based access control must be enforced at API level
- **NFR-010**: System must log all user actions for audit compliance

### Reliability
- **NFR-011**: System uptime target 99.5% (3.6 hours/month max downtime)
- **NFR-012**: Automated daily backups required with 30-day retention
- **NFR-013**: Restore point recovery time objective (RTO) < 4 hours
- **NFR-014**: Data recovery point objective (RPO) < 1 hour

### Usability
- **NFR-015**: Intake workflow MUST complete in ≤3 steps
- **NFR-016**: Search results must appear within 1 second
- **NFR-017**: All forms must support tab navigation and keyboard shortcuts
- **NFR-018**: Mobile-responsive design for case lookup (not full app)

### Scalability
- **NFR-019**: Database architecture must support growth to 10,000+ cases
- **NFR-020**: File storage must support growth to 100GB+ attachments
- **NFR-021**: API architecture must support horizontal scaling

### Maintainability
- **NFR-022**: Codebase must follow consistent style guide
- **NFR-023**: All public functions/APIs must have documentation
- **NFR-024**: Unit test coverage minimum 80%
- **NFR-025**: Integration test coverage for all workflows

## Edge Cases & Error Scenarios

### Data Integrity
- What happens when same owner calls twice within 5 minutes? (Duplicate detection required)
- What happens if case status changes while staff member is editing notes? (Optimistic locking or conflict notification)
- What happens if file upload fails midway? (Automatic cleanup and user notification)

### System Failures
- What happens if database connection drops? (Graceful error message, automatic retry)
- What happens if file storage becomes full? (Alert admin, prevent new uploads)
- What happens during backup? (Non-blocking, transparent to users)

### Permission & Access
- What happens if staff tries to edit another staff member's case? (Permissions check, access denied)
- What happens if admin role is removed while user is logged in? (Permission level re-evaluated on next request)
- What happens if case is archived while staff member is viewing it? (Show notification, reload prevented)

### Business Logic
- What happens if case is marked closed but new note is added? (Allow reopening or new note triggers reopening)
- What happens if service is assigned but assignee is deactivated? (Flag for reassignment)
- What happens if multiple users save case changes simultaneously? (Last write wins with audit trail, or optimistic locking prevents)

## Success Definition

The PHCS project is successful when:

1. ✅ All 10 user stories are implemented and tested
2. ✅ All functional requirements (FR-001 through FR-024) are met
3. ✅ All success criteria (SC-001 through SC-016) are validated
4. ✅ Audit trail shows zero cases lost or corrupted during migration
5. ✅ Staff adoption reaches 95%+ within 2 months
6. ✅ System demonstrates 99.5% uptime over first 3 months
7. ✅ Management successfully generates first monthly report
8. ✅ Intake time reduction (10 min → 3 min) is demonstrated
9. ✅ All edge cases have documented handling and error messages
10. ✅ Documentation is complete, staff are trained, system is operationally supported
