---
id: task-003
title: "Authentication & Authorization Framework"
category: "Infrastructure"
priority: "P0"
estimated_hours: 8
---

## Task Overview

Implement JWT-based authentication and role-based access control (RBAC) system for all API endpoints.

## Description

Set up the complete authentication and authorization system including user login, JWT token generation, password hashing, and permission enforcement at the API level.

**Scope**:
- Implement user login endpoint (`POST /api/auth/login`)
- Implement JWT token generation and validation
- Implement password hashing with bcrypt
- Create authentication middleware for route protection
- Create RBAC middleware to enforce permissions by role
- Implement logout endpoint
- Implement token refresh endpoint
- Implement password change endpoint
- Set up role-based permission matrix
- Add authentication to all API routes

## Acceptance Criteria

- [ ] POST /api/auth/login accepts email and password, returns JWT token
- [ ] JWT token contains user_id, email, role, expiration
- [ ] Token validation middleware rejects expired or invalid tokens
- [ ] All API routes except /auth/* require valid JWT
- [ ] Password is hashed before storage (bcrypt cost factor 12+)
- [ ] Password change endpoint validates old password before accepting new password
- [ ] RBAC middleware checks user role and denies access if insufficient permissions
- [ ] Test login with staff, case manager, admin roles returns correct permissions
- [ ] Token expiration is set to 1 hour
- [ ] Refresh token endpoint issues new token without re-authentication

## Inputs

- Authentication requirements from `.specify/plan/main.md`
- User roles and permissions matrix
- JWT configuration parameters

## Outputs

- Authentication middleware (`backend/src/middleware/auth.ts`)
- RBAC middleware (`backend/src/middleware/rbac.ts`)
- Authentication controller (`backend/src/controllers/auth.controller.ts`)
- Authentication service (`backend/src/services/auth.service.ts`)
- Type definitions for JWT payload (`backend/src/types/jwt.types.ts`)
- Integration tests for authentication endpoints

## Dependencies

- Task-002 (Database Schema)
- Task-001 (Project Structure)

## Technical Notes

**JWT Configuration**:
- Algorithm: HS256 (HMAC SHA-256)
- Secret: Stored in environment variable `JWT_SECRET`
- Expiration: 1 hour (3600 seconds)
- Issuer: "phcs"

**Password Hashing**:
- Algorithm: bcrypt
- Cost factor: 12+
- Storage: `password_hash` column in users table

**Middleware Order**:
1. Parse request body (express.json)
2. Auth middleware (verify JWT)
3. RBAC middleware (check permissions)
4. Route handler

**Permission Checks**:
- Route level: Middleware checks required role(s)
- Query level: Filter results based on user role
- Example: Staff can only see own cases, Case Manager sees all

**Roles**:
- Staff: Basic intake staff (can create cases)
- Case Manager: Case management authority
- Service Coordinator: Service-specific updates
- Admin: Full system access
- Director: Read-only reporting

## Success Criteria

✓ Authentication flow works end-to-end
✓ RBAC prevents unauthorized access
✓ Passwords are properly hashed
✓ Tokens expire and refresh correctly
