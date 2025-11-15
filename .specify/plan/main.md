# Implementation Plan: Pet Help Center Case Management System (PHCS)

**Branch**: `phcs-case-management` | **Date**: 2025-11-15 | **Spec**: `.specify/spec/main.md`

## Summary

Jacksonville Humane Society (JHS) manages emergency pet assistance across fragmented systems (voicemail + WaitWhile), causing data silos and poor reporting. PHCS consolidates case management into a unified full-stack web application with centralized data, automated file ingestion, comprehensive CRUD operations with soft deletes, real-time dashboards, and role-based access control. The system eliminates duplicate entry, enables data-driven decision making, and scales for organizational growth.

**Key Technical Approach**: 
- Full-stack web application (React frontend, Node.js/Express backend, PostgreSQL database)
- Microservices-ready architecture with clear separation of concerns
- File storage layer (AWS S3 or local storage with future cloud migration)
- Role-based access control enforced at API and UI levels
- Comprehensive audit logging for compliance and dispute resolution
- REST API with JSON, supporting future mobile integration

## Technical Context

**Language/Version**: 
- Backend: Node.js 18.x (LTS), TypeScript 5.x
- Frontend: React 18.x with TypeScript 5.x
- Database: PostgreSQL 14.x

**Primary Dependencies**: 
- Backend: Express.js, TypeORM, JWT, Multer (file upload), pg (PostgreSQL driver)
- Frontend: React Router, Axios, React Query, Tailwind CSS, React Hook Form
- Infrastructure: Docker, Docker Compose for local dev; cloud deployment (AWS Lambda/RDS or similar)

**Storage**: 
- Primary: PostgreSQL 14.x for relational data, audit logs, case records
- Files: AWS S3 (production) or local filesystem (development/small deployments)
- Cache: Redis for session management and performance optimization

**Testing**: 
- Backend: Jest for unit tests, Supertest for integration tests, TypeORM factories for fixtures
- Frontend: Jest, React Testing Library for component tests, Playwright for E2E tests
- Coverage target: Minimum 80% unit test coverage for backend, 70% for frontend

**Target Platform**: 
- Web application deployable to AWS, GCP, or on-premises Linux servers
- Responsive design supporting desktop and mobile access (case lookup feature)
- Browser compatibility: Chrome, Firefox, Safari, Edge (latest versions)

**Project Type**: Full-stack web application (backend API + React frontend)

**Performance Goals**: 
- 1000+ requests/second throughput capacity
- Intake workflow < 3 minutes per case
- Search results < 1 second
- Report generation < 5 minutes
- Dashboard load < 2 seconds

**Constraints**: 
- Limited IT staff (1 FTE) at JHS - system must be operationally simple, well-documented
- Nonprofit budget - open-source preferred, cloud costs minimized
- Data security compliance (CCPA/GDPR if applicable)
- Zero data loss during migration from WaitWhile system

**Scale/Scope**: 
- Initial: 500+ historical cases, 50-200 concurrent staff users
- Growth target: 10,000+ cases within 18 months
- File storage: 100GB+ attachments over time
- Multi-location support planned for Phase 2

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PHCS Architecture                        │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────┐         ┌────────────────────────────────┐
│   React Frontend  │         │   Mobile (Future Phase)        │
│   - Dashboard     │         │   - Case Lookup               │
│   - Case Mgmt     │         │   - Notes                     │
│   - Reporting     │         │   - File Preview              │
│   - User Admin    │         └────────────────────────────────┘
└──────────┬────────┘
           │ HTTPS/REST API
           │
    ┌──────▼─────────────────────────────────────┐
    │  Node.js/Express Backend                  │
    │  ┌──────────────────────────────────────┐  │
    │  │  API Routes & Controllers            │  │
    │  │  - /api/cases                        │  │
    │  │  - /api/owners                       │  │
    │  │  - /api/services                     │  │
    │  │  - /api/users                        │  │
    │  │  - /api/reports                      │  │
    │  │  - /api/files                        │  │
    │  └──────────────────────────────────────┘  │
    │  ┌──────────────────────────────────────┐  │
    │  │  Middleware Layer                    │  │
    │  │  - JWT Authentication               │  │
    │  │  - Role-Based Access Control        │  │
    │  │  - Request Validation               │  │
    │  │  - Error Handling                   │  │
    │  │  - Audit Logging                    │  │
    │  └──────────────────────────────────────┘  │
    │  ┌──────────────────────────────────────┐  │
    │  │  Service Layer                       │  │
    │  │  - CaseService                       │  │
    │  │  - OwnerService                      │  │
    │  │  - ServiceAssignmentService          │  │
    │  │  - ReportingService                  │  │
    │  │  - FileService                       │  │
    │  │  - UserService                       │  │
    │  │  - AuditService                      │  │
    │  └──────────────────────────────────────┘  │
    │  ┌──────────────────────────────────────┐  │
    │  │  Database Layer (TypeORM)            │  │
    │  │  - Entity Definitions                │  │
    │  │  - Query Builder                     │  │
    │  │  - Migrations                        │  │
    │  └──────────────────────────────────────┘  │
    └────────┬─────────────────────────┬────────┘
             │                         │
    ┌────────▼──────────┐   ┌──────────▼───────────┐
    │  PostgreSQL DB    │   │  File Storage        │
    │  (Relational)     │   │  (S3/Filesystem)     │
    │  - Cases          │   │  - Uploaded docs     │
    │  - Owners         │   │  - Intake forms      │
    │  - Pets           │   │  - Medical records   │
    │  - Notes          │   │  - Photos            │
    │  - Audit Logs     │   │  - Reports           │
    │  - Users          │   └──────────────────────┘
    └───────────────────┘
             │
    ┌────────▼──────────────────────┐
    │  Cache Layer (Redis)           │
    │  - Session Management         │
    │  - Performance Cache           │
    │  - Report Cache                │
    └───────────────────────────────┘
```

## Data Ingestion Workflow

### Phase 1: Data Preparation & Validation

```
WaitWhile Export → Data Mapper → Validation Rules → Staging Table
     (CSV/JSON)                  (field mapping)    (PostgreSQL)
                                      ↓
                           Check for errors
                                      ↓
                           Display report to admin
                                      ↓
                    [Admin approves] or [Abort]
```

**Steps**:
1. JHS exports all cases from WaitWhile system (CSV or API export)
2. Import job runs data mapper to transform external format → PHCS schema
3. Validation engine checks:
   - Required fields present
   - Phone/email format valid
   - No duplicate cases (by owner phone + pet name)
   - Date ranges valid
4. Report generated: X records valid, Y warnings, Z errors
5. Admin reviews, confirms to proceed or aborts for manual fixes
6. Valid records inserted to staging table with `source = 'waitwhile_import'`

### Phase 2: Reconciliation & Deduplication

```
Staging Table → Dedup Logic → Match to Existing → Final Cases Table
   (raw import)   (compare     (if any new       (confirmed)
                   with old     users added)
                   system)
                        ↓
                   Update existing
                   or create new
```

**Logic**:
- Check if owner already exists by phone + name fuzzy match
- Check if pet already exists by name + owner ID + species
- Link to existing owner if found, otherwise create new owner record
- Create or update case record based on import data
- Set `created_at` to original creation date from WaitWhile if available

### Phase 3: Validation & Audit

```
Final Cases → Audit Trail Entry → Verify Counts → Migration Report
   (all       (source='import'    (match export  (summary
   imported)   timestamp, etc)     record count)  & email JHS)
```

**Outputs**:
- Migration completion report with:
  - Total records imported: X
  - New owners created: Y
  - New cases created: Z
  - Duplicates found and linked: W
  - Errors encountered: V (with details)
- All import activities logged to audit table for compliance

## Case Management Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                   CASE LIFECYCLE                             │
└──────────────────────────────────────────────────────────────┘

     ┌─────────────┐
     │  INTAKE     │  Staff creates case with owner/pet info
     │  (New)      │  Files: none initially
     └──────┬──────┘
            │
            ▼
     ┌─────────────────┐
     │  ASSIGNMENT     │  Case manager reviews and assigns services
     │  (In Progress)  │  Services: Medical, Boarding, Behavioral, Food
     └──────┬──────────┘
            │
      ┌─────┴──────────────────┬──────────────┐
      │                        │              │
      ▼                        ▼              ▼
   Medical Team          Boarding Team   Behavioral Support
   (Coordinate)          (Coordinate)    (Coordinate)
      │                        │              │
      └─────────────┬──────────┴──────────────┘
                    │
                    ▼
           ┌────────────────────┐
           │  ACTIVE SUPPORT    │  All teams report progress
           │  (In Progress)     │  Notes updated, files added
           └────────┬───────────┘
                    │
                    ▼
           ┌────────────────────┐
           │  HOLD (Optional)   │  Waiting for owner, vet, etc.
           │  (On Hold)         │  Automatic resume when ready
           └────────┬───────────┘
                    │
                    ▼
           ┌────────────────────┐
           │  CLOSURE           │  Pet has permanent solution
           │  (Closed)          │  Services complete, owner stable
           └────────┬───────────┘
                    │
                    ▼
           ┌────────────────────┐
           │  ARCHIVE           │  End of fiscal year or 6mo+ closed
           │  (Archived)        │  Still accessible for history/audit
           └────────────────────┘
```

**Workflow Details**:

1. **Intake** - Staff creates case:
   - Input: Owner name, phone, email; pet name, breed, age
   - System: Generates case_id, captures created_at
   - Output: Case appears in case list with status "New"

2. **Review** - Case manager reviews:
   - Check for duplicate owner records
   - Determine appropriate services
   - Assign to service coordinators

3. **Active Support** - Services provided:
   - Medical team treats pet, updates case with medical notes
   - Boarding team arranges emergency stay, updates case
   - Behavioral team counsels owner, adds behavioral notes
   - Each team marks their service "Complete" when done

4. **Closure** - All services complete:
   - Case manager marks case status "Closed"
   - Documents final outcome and owner status
   - Captures closed_at timestamp

5. **Archive** - After 6 months or end of fiscal year:
   - Cases marked "Archived" (soft delete)
   - Still searchable with filter `include_archived=true`
   - Data preserved for compliance and historical analysis

## Reporting Architecture

### Report Types

#### 1. Case Volume Report
```
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
**Output**: CSV with monthly case counts by status and service type

#### 2. Service Utilization Report
```
SELECT 
  service_type,
  COUNT(DISTINCT case_id) as cases_served,
  COUNT(DISTINCT owner_id) as unique_owners,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) as avg_days_to_complete
FROM service_assignments
WHERE created_at >= ? AND created_at < ?
  AND status = 'Complete'
GROUP BY service_type
```
**Output**: CSV with service statistics (volume, unique clients, resolution time)

#### 3. Case Outcome Report
```
SELECT 
  owner_id,
  COUNT(*) as total_cases,
  COUNT(CASE WHEN status = 'Closed' THEN 1 END) as resolved_cases,
  MAX(closed_at) as most_recent_closure
FROM cases
WHERE created_at >= ? AND created_at < ?
GROUP BY owner_id
ORDER BY total_cases DESC
```
**Output**: CSV with owner case history and resolution rates

#### 4. Staff Activity Report
```
SELECT 
  assigned_to,
  COUNT(*) as cases_handled,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_case_duration,
  COUNT(DISTINCT owner_id) as unique_owners_served
FROM cases
WHERE created_at >= ? AND created_at < ?
  AND assigned_to IS NOT NULL
GROUP BY assigned_to
```
**Output**: CSV with staff productivity metrics

### Dashboard Metrics

**Real-time Dashboard** displays:
- Total Active Cases (count)
- Cases by Status (pie chart: New/In Progress/On Hold/Closed)
- Cases by Service Type (bar chart)
- Average Case Duration (in days)
- This Month vs Last Month (trend)
- Service Coordinator Workload (table: name, assigned cases)
- Recent Cases (table: last 10 created)

**Data Refresh**: Dashboard data updated every 5 minutes (cached)

## File Upload & Preview Flow

```
┌─────────────────────────────────────────────────────────────┐
│              FILE UPLOAD PROCESS                            │
└─────────────────────────────────────────────────────────────┘

  User selects file (PDF, image, doc)
         │
         ▼
  Upload size check (< 50MB)
         │
    [Valid] [Invalid → Error]
         │
         ▼
  POST /api/cases/:id/files
  (multipart/form-data)
         │
         ▼
  Server receives file
  Generate filename: {case_id}_{timestamp}_{original}.{ext}
         │
         ▼
  Save to storage (S3 or local)
         │
  ┌──────┴──────┐
  │             │
  ▼             ▼
S3 Storage   Local FS
  │             │
  └──────┬──────┘
         │
         ▼
  Create file_id record in database
  - file_id, case_id, filename, file_path, file_size, file_type
  - uploaded_by, uploaded_at
         │
         ▼
  Return file record to client
  Display in case file list
```

**File Preview**:
```
Click file in case file list
         │
         ▼
GET /api/files/:file_id/download
         │
         ▼
  Server validates:
  - User has access to case
  - File exists and hasn't been deleted
         │
         ▼
  For images/PDF: Return file via browser (in-app preview)
  For documents: Return download link or preview
         │
         ▼
  Browser displays file inline or prompts download
```

**File Types Supported**:
- Images: JPEG, PNG, GIF, WEBP
- Documents: PDF, DOC, DOCX, TXT
- Spreadsheets: XLS, XLSX, CSV

**Storage Strategy**:
- Development: Local filesystem (`./uploads/`)
- Production: AWS S3 with server-side encryption
- Backup: Included in database backup (file metadata) + storage backup (actual files)

## Database Schema

### Core Tables

#### `cases` table
```sql
CREATE TABLE cases (
  case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES owners(owner_id),
  pet_id UUID REFERENCES pets(pet_id),
  status VARCHAR(50) NOT NULL DEFAULT 'New' 
    CHECK (status IN ('New', 'In Progress', 'On Hold', 'Closed', 'Archived')),
  service_type VARCHAR(100) NOT NULL,
    -- Examples: 'Food', 'Medical', 'Boarding', 'Behavioral', 'Multiple'
  assigned_to UUID REFERENCES users(user_id),
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(user_id),
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_created_at (created_at),
  INDEX idx_is_archived (is_archived)
);
```

#### `owners` table
```sql
CREATE TABLE owners (
  owner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_name (name)
);
```

#### `pets` table
```sql
CREATE TABLE pets (
  pet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES owners(owner_id),
  name VARCHAR(255) NOT NULL,
  species VARCHAR(50) NOT NULL, -- 'Dog', 'Cat', 'Rabbit', etc.
  breed VARCHAR(255),
  age_years INTEGER,
  color VARCHAR(100),
  weight_lbs DECIMAL(5,2),
  health_notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner_id (owner_id),
  INDEX idx_species (species)
);
```

#### `case_notes` table
```sql
CREATE TABLE case_notes (
  note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(user_id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  INDEX idx_case_id (case_id),
  INDEX idx_created_at (created_at)
);
```

#### `case_files` table
```sql
CREATE TABLE case_files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(1024) NOT NULL,
  file_type VARCHAR(50), -- 'pdf', 'image', 'doc', etc.
  file_size_bytes BIGINT,
  uploaded_by UUID NOT NULL REFERENCES users(user_id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  INDEX idx_case_id (case_id),
  INDEX idx_uploaded_at (uploaded_at)
);
```

#### `service_assignments` table
```sql
CREATE TABLE service_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL, 
    -- 'Medical', 'Boarding', 'Behavioral', 'Food', etc.
  assigned_to UUID NOT NULL REFERENCES users(user_id),
  status VARCHAR(50) NOT NULL DEFAULT 'Assigned'
    CHECK (status IN ('Assigned', 'In Progress', 'Complete')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_case_id (case_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status)
);
```

#### `users` table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Staff'
    CHECK (role IN ('Staff', 'Case Manager', 'Service Coordinator', 'Admin', 'Director')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

#### `audit_logs` table
```sql
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL, -- 'Case', 'Note', 'ServiceAssignment', etc.
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'Create', 'Update', 'Delete', 'Archive'
  changes JSONB, -- JSON object of what changed
  changed_by UUID REFERENCES users(user_id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT,
  INDEX idx_entity_id (entity_id),
  INDEX idx_changed_at (changed_at),
  INDEX idx_changed_by (changed_by)
);
```

### Views & Analytics

#### `case_summary` view
```sql
CREATE VIEW case_summary AS
SELECT 
  c.case_id,
  c.status,
  c.service_type,
  o.name as owner_name,
  o.phone as owner_phone,
  p.name as pet_name,
  p.species,
  u.name as assigned_staff,
  COUNT(n.note_id) as note_count,
  COUNT(f.file_id) as file_count,
  c.created_at,
  c.updated_at,
  EXTRACT(EPOCH FROM (COALESCE(c.closed_at, NOW()) - c.created_at))/86400 as days_active
FROM cases c
JOIN owners o ON c.owner_id = o.owner_id
LEFT JOIN pets p ON c.pet_id = p.pet_id
LEFT JOIN users u ON c.assigned_to = u.user_id
LEFT JOIN case_notes n ON c.case_id = n.case_id
LEFT JOIN case_files f ON c.case_id = f.case_id
WHERE c.is_archived = FALSE
GROUP BY c.case_id, o.name, o.phone, p.name, p.species, u.name;
```

## API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/change-password
```

### Cases
```
GET    /api/cases                    (list all, filtered)
POST   /api/cases                    (create new)
GET    /api/cases/:id                (get detail)
PUT    /api/cases/:id                (update)
DELETE /api/cases/:id                (soft delete/archive)
POST   /api/cases/:id/restore         (restore archived case)
GET    /api/cases/:id/history         (get case change history)
```

### Owners
```
GET    /api/owners                    (list all)
POST   /api/owners                    (create new)
GET    /api/owners/:id                (get detail)
PUT    /api/owners/:id                (update)
GET    /api/owners/:id/cases          (get all cases for owner)
```

### Pets
```
GET    /api/pets                      (list all)
POST   /api/pets                      (create new)
GET    /api/pets/:id                  (get detail)
PUT    /api/pets/:id                  (update)
```

### Case Notes
```
POST   /api/cases/:case_id/notes      (add note)
GET    /api/cases/:case_id/notes      (list notes)
PUT    /api/cases/:case_id/notes/:id  (update note)
DELETE /api/cases/:case_id/notes/:id  (delete note)
```

### Files
```
POST   /api/cases/:case_id/files             (upload file)
GET    /api/cases/:case_id/files             (list files)
GET    /api/files/:file_id/download          (download file)
DELETE /api/files/:file_id                   (delete file)
GET    /api/files/:file_id/preview           (get preview)
```

### Service Assignments
```
POST   /api/cases/:case_id/services          (assign service)
GET    /api/cases/:case_id/services          (list assignments)
PUT    /api/cases/:case_id/services/:id      (update assignment status)
DELETE /api/cases/:case_id/services/:id      (cancel assignment)
```

### Users
```
GET    /api/users                     (admin: list all)
POST   /api/users                     (admin: create user)
GET    /api/users/:id                 (get user detail)
PUT    /api/users/:id                 (admin: update user)
DELETE /api/users/:id                 (admin: deactivate user)
GET    /api/users/me                  (get current user)
```

### Reports
```
GET    /api/reports/case-volume       (case volume by period)
GET    /api/reports/service-utilization (service metrics)
GET    /api/reports/case-outcomes     (outcome statistics)
GET    /api/reports/staff-activity    (staff performance)
POST   /api/reports/export            (export report to CSV)
```

### Dashboard
```
GET    /api/dashboard/metrics         (dashboard summary)
GET    /api/dashboard/recent-cases    (last 10 cases)
GET    /api/dashboard/coordinator-workload (assignments by coordinator)
```

### Admin
```
POST   /api/admin/import               (import case data)
GET    /api/admin/audit-log            (view audit logs)
POST   /api/admin/backup               (trigger backup)
GET    /api/admin/system-health        (system status)
```

### Search
```
GET    /api/search                     (global search across cases/owners)
GET    /api/search/cases               (search cases)
GET    /api/search/owners              (search owners)
```

## Authentication & RBAC Plan

### Authentication Flow

```
User Login
    │
    ▼
POST /api/auth/login
  { email, password }
    │
    ▼
Backend validates credentials
    │
    [Invalid] → 401 Unauthorized
    │
    [Valid] → Generate JWT token
    │
    ▼
Return JWT in response (or HttpOnly cookie)
    │
    ▼
Client stores token (localStorage or cookie)
    │
    ▼
For each request: Include Authorization header
    Bearer <JWT_TOKEN>
    │
    ▼
Server validates JWT
    │
    [Invalid] → 401 Unauthorized
    │
    [Valid] → Extract user_id, role from JWT
           → Continue request
    │
    ▼
Response returned
```

**JWT Structure**:
```json
{
  "sub": "user_id",
  "email": "staff@jhs.org",
  "role": "Case Manager",
  "iat": 1700000000,
  "exp": 1700003600,
  "iss": "phcs"
}
```

### Role-Based Access Control (RBAC)

**Permission Matrix**:

| Feature | Staff | Case Mgr | Svc Coord | Admin | Director |
|---------|-------|----------|-----------|-------|----------|
| Create Case | ✓ | ✓ | ✗ | ✓ | ✗ |
| Edit Case | ✓ (own) | ✓ | ✓ (service) | ✓ | ✗ |
| Delete Case (soft) | ✗ | ✗ | ✗ | ✓ | ✗ |
| View All Cases | ✗ | ✓ | ✓ (assigned) | ✓ | ✗ |
| View Case Notes | ✓ | ✓ | ✓ | ✓ | ✗ |
| Upload Files | ✓ | ✓ | ✓ | ✓ | ✗ |
| Assign Service | ✗ | ✓ | ✗ | ✓ | ✗ |
| View Reports | ✗ | ✓ | ✓ | ✓ | ✓ |
| Export Data | ✗ | ✗ | ✗ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | ✗ | ✓ | ✗ |
| View Audit Logs | ✗ | ✗ | ✗ | ✓ | ✗ |

**Implementation**:

1. **API-level enforcement** (Middleware):
```javascript
// Check user role on every request
if (requiredRoles.includes(user.role)) {
  // Continue to handler
} else {
  // Return 403 Forbidden
}
```

2. **Query-level enforcement**:
```javascript
// Staff can only see their own cases
let query = Case.find();
if (user.role === 'Staff') {
  query = query.where({ assigned_to: user.user_id });
}
// Continue query
```

3. **UI-level enforcement**:
```javascript
// Hide features not available to role
if (user.role === 'Admin') {
  showUserManagement();
}
```

## Deployment Strategy

### Development Environment
```
Local Docker Compose setup:
- Backend container (Node.js)
- PostgreSQL container
- Redis container (optional)
- Frontend development server (React)

start: docker-compose up
stop: docker-compose down
```

### Staging Environment
```
AWS deployment (example):
- RDS PostgreSQL
- ALB (Application Load Balancer)
- ECS Fargate containers (backend)
- CloudFront + S3 (frontend, static assets)
- S3 (file storage)
- CloudWatch (logging)
- Route53 (DNS)

Purpose: Full testing before production
```

### Production Environment
```
AWS deployment (example):
- RDS PostgreSQL with Multi-AZ failover
- ALB with auto-scaling
- ECS Fargate clusters (backend, auto-scale 2-10 replicas)
- CloudFront + S3 (frontend CDN)
- S3 with versioning (file storage + backup)
- CloudWatch + CloudTrail (logging + audit)
- WAF (Web Application Firewall)
- KMS (encryption key management)
- Route53 (DNS)

Backup strategy:
- Automated daily RDS snapshots (30-day retention)
- Cross-region replication
- S3 versioning for file storage
- Disaster recovery: RTO < 4 hours, RPO < 1 hour
```

### CI/CD Pipeline

```
Push to main branch
        │
        ▼
GitHub Actions / CI Server
  ├─ Run linting (ESLint, Prettier)
  ├─ Run unit tests (Jest)
  ├─ Run integration tests
  ├─ Build Docker image
  ├─ Push to registry
        │
        [Success] → Deploy to Staging
                        │
                        ▼
                    Run E2E tests (Playwright)
                    Run smoke tests
                        │
                        [Success] → Create release & tag
                                        │
                                        ▼
                                   Manual approval
                                        │
                                    [Approved]
                                        │
                                        ▼
                                  Deploy to Production
```

### Monitoring & Observability

**Logs**:
- Application logs (stdout to CloudWatch)
- Access logs (ALB)
- Error logs (exceptions, stack traces)
- Audit logs (database table)

**Metrics**:
- Request latency (p50, p95, p99)
- Error rate (5xx, 4xx responses)
- Database query time
- Cache hit ratio
- Active user sessions
- File upload size/count

**Alerts**:
- High error rate (> 5%)
- High latency (p95 > 2s)
- Database connection issues
- Disk space low
- Backup failures

## Security Considerations

1. **Data Protection**:
   - Passwords hashed with bcrypt (cost factor 12)
   - Sensitive data encrypted at rest (KMS)
   - All traffic over HTTPS/TLS
   - Database encrypted (RDS encryption)

2. **Access Control**:
   - JWT token expiration (1 hour)
   - Role-based access control at API level
   - Principle of least privilege for service accounts
   - MFA for admin accounts (future phase)

3. **Audit & Compliance**:
   - All changes logged to audit_logs table
   - Immutable audit trail (no direct deletes)
   - Monthly audit report generated
   - GDPR compliance (right to deletion, data export)
   - CCPA compliance (if applicable)

4. **Infrastructure**:
   - Network segmentation (VPC, security groups)
   - WAF rules for SQL injection, XSS prevention
   - Rate limiting on API endpoints
   - DDoS protection (CloudFlare or AWS Shield)
   - Regular security patching and updates

## Technology Stack Summary

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend Framework | React | 18.x | Industry standard, component-based, JSX |
| Frontend Language | TypeScript | 5.x | Type safety, better IDE support |
| Frontend Styling | Tailwind CSS | 3.x | Utility-first, rapid UI development |
| Frontend Routing | React Router | 6.x | Standard routing for React SPAs |
| Frontend Forms | React Hook Form | 7.x | Performant form management |
| Frontend HTTP | Axios | 1.x | Promise-based HTTP client |
| Backend Framework | Express.js | 4.x | Lightweight, widely adopted Node framework |
| Backend Language | TypeScript | 5.x | Type safety for API contracts |
| Backend ORM | TypeORM | 0.3.x | Type-safe database access, migrations |
| Database | PostgreSQL | 14.x | ACID compliance, JSON support, proven at scale |
| Authentication | JWT + bcrypt | - | Stateless, secure password hashing |
| File Upload | Multer | 1.x | Standard Express middleware for uploads |
| File Storage | AWS S3 / Filesystem | - | Scalable object storage |
| Caching | Redis | 7.x | Session management, performance optimization |
| Testing Backend | Jest + Supertest | - | Excellent Node.js testing framework |
| Testing Frontend | Jest + React Testing Library | - | Best practices for component testing |
| E2E Testing | Playwright | 1.x | Cross-browser, reliable E2E testing |
| Container | Docker | 20.x | Standardized deployment |
| Orchestration | Docker Compose (dev) / ECS (prod) | - | Local dev simplicity, AWS integration |
| CI/CD | GitHub Actions | - | Native GitHub integration |
| Monitoring | CloudWatch / ELK | - | Centralized logging and metrics |

---

**Next Steps**: Proceed to task breakdown phase (`.specify/tasks/main.md`) with 20 tasks grouped by feature area.
