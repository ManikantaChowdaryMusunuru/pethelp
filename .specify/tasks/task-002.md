---
id: task-002
title: "PostgreSQL Database Schema & Migrations"
category: "Infrastructure"
priority: "P0"
estimated_hours: 8
---

## Task Overview

Create and implement the complete PostgreSQL database schema including all tables, relationships, indexes, and initial migrations.

## Description

Implement the database schema as defined in `.specify/plan/main.md` using TypeORM migrations. This establishes the data layer that all application logic depends on.

**Scope**:
- Define TypeORM entities for all tables (Case, Owner, Pet, Note, File, ServiceAssignment, User, AuditLog)
- Create database migration files using TypeORM
- Set up database connection configuration
- Create database views (case_summary)
- Add indexes for performance optimization
- Set up database seeding for test data
- Configure migration scripts (up/down)

## Acceptance Criteria

- [ ] All TypeORM entities are defined with proper relationships
- [ ] Initial migration creates all tables with correct columns and types
- [ ] Foreign keys are properly configured with cascading delete where appropriate
- [ ] Indexes are created on commonly queried columns (owner_id, status, assigned_to, created_at)
- [ ] Database views exist (case_summary)
- [ ] Migration can be run with `npm run typeorm migration:run`
- [ ] Migration can be reverted with `npm run typeorm migration:revert`
- [ ] Test database seeding script populates sample data
- [ ] Database connection from Node.js app is successful
- [ ] All entities have proper timestamp fields (created_at, updated_at)

## Inputs

- Database schema from `.specify/plan/main.md`
- TypeORM documentation
- PostgreSQL connection parameters

## Outputs

- TypeORM entity definitions (*.entity.ts files in `backend/src/models/`)
- Initial migration file (*.ts in `backend/src/database/migrations/`)
- Database connection configuration (`backend/src/database/connection.ts`)
- Database seed script (`backend/src/database/seed.ts`)
- Schema documentation

## Dependencies

- Task-001 (Project Structure Setup)

## Technical Notes

**Key Entities**:
- `cases`: Core case management table
- `owners`: Pet owner information
- `pets`: Pet details
- `case_notes`: Individual case notes
- `case_files`: Uploaded files
- `service_assignments`: Service tracking
- `users`: System users
- `audit_logs`: Immutable change log

**Relationships**:
- Case → Owner (N:1)
- Case → Pet (N:1)
- Pet → Owner (N:1)
- CaseNote → Case (N:1, CASCADE delete)
- CaseFile → Case (N:1, CASCADE delete)
- ServiceAssignment → Case (N:1, CASCADE delete)
- ServiceAssignment → User (N:1)
- Case → User (N:1, assigned_to)

**Performance Considerations**:
- Index on `cases.owner_id` for owner-case queries
- Index on `cases.status` for filtering active/closed cases
- Index on `cases.created_at` for date-range queries
- Composite index on `service_assignments(case_id, status)`
- Index on `audit_logs.changed_at` for audit queries

## Success Criteria

✓ Database is accessible via Node.js application
✓ All tables created with proper relationships
✓ Sample data can be seeded successfully
✓ Migrations are repeatable and reversible
