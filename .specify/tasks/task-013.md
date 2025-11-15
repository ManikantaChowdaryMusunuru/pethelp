---
id: task-013
title: "User Management & Admin Endpoints"
category: "User Management"
priority: "P2"
estimated_hours: 8
---

## Task Overview

Implement user account management and administrative controls for staff and system management.

## Description

Create endpoints for admin to manage user accounts, roles, permissions, and system configuration.

**Scope**:
- Implement GET /api/users (list all users)
- Implement POST /api/users (create new user)
- Implement GET /api/users/:id (get user detail)
- Implement PUT /api/users/:id (update user)
- Implement DELETE /api/users/:id (deactivate user)
- Implement GET /api/users/me (get current user)
- Implement role-based user creation with correct permissions
- Implement user activation/deactivation workflow
- Create UserService
- Track user creation and last login
- Add integration tests

## Acceptance Criteria

- [ ] GET /api/users returns list of all users (admin only)
- [ ] POST /api/users creates user with email, name, role (admin only)
- [ ] Email must be unique across users
- [ ] Password auto-generated on creation, must be changed on first login
- [ ] GET /api/users/:id returns user detail with role and status
- [ ] PUT /api/users/:id updates user name, email, role (admin only)
- [ ] Cannot change own role (prevent privilege escalation)
- [ ] DELETE /api/users/:id deactivates user (soft delete, no hard delete)
- [ ] Deactivated users cannot log in
- [ ] GET /api/users/me returns current logged-in user
- [ ] Role can be: Staff, Case Manager, Service Coordinator, Admin, Director
- [ ] User creation triggers notification email (future feature flag)
- [ ] Integration tests verify all operations

## Inputs

- User management requirements from spec
- Role definitions and permissions matrix

## Outputs

- User controller (`backend/src/controllers/users.controller.ts`)
- User service (`backend/src/services/users.service.ts`)
- Integration tests

## Dependencies

- Task-003 (Authentication)
- Task-002 (Database Schema)

## Technical Notes

**User Roles & Permissions**:
- **Staff**: Create cases, edit own cases, view case notes/files
- **Case Manager**: Full case CRUD, assign services, view all cases, see reports
- **Service Coordinator**: Edit service-specific cases, mark services complete
- **Admin**: Full system access, user management, data import, audit logs
- **Director**: View-only dashboards, reports, export data

**User Creation Workflow**:
1. Admin creates user with email and role
2. System generates temporary password
3. Email sent with temporary password and login link
4. User logs in and must change password
5. User account activated

**Password Requirements**:
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, special characters
- Cannot reuse last 3 passwords

**User Deactivation**:
- Soft delete: is_active = false
- User cannot log in
- User data retained for audit
- Can be reactivated

**User Fields**:
- `user_id`: UUID
- `email`: Unique
- `name`: Display name
- `phone`: Optional contact
- `role`: Enum (Staff, Case Manager, Service Coordinator, Admin, Director)
- `password_hash`: Bcrypt hashed
- `is_active`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `last_login_at`: Timestamp

**Audit Trail for Users**:
- User creation logged
- Role changes logged
- Login attempts logged (successful and failed)
- User deactivation logged

## Success Criteria

✓ Users can be created and managed
✓ Roles are properly enforced
✓ User data is properly stored
✓ Deactivation works correctly
