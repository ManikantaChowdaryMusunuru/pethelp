---
id: task-005
title: "Owner & Pet Management Endpoints"
category: "Case Management"
priority: "P1"
estimated_hours: 8
---

## Task Overview

Implement CRUD operations for pet owners and pets with duplicate detection and relationship management.

## Description

Create endpoints and services for managing owner and pet information, including owner-pet relationships and duplicate owner detection.

**Scope**:
- Implement GET /api/owners (list)
- Implement POST /api/owners (create)
- Implement GET /api/owners/:id (detail)
- Implement PUT /api/owners/:id (update)
- Implement GET /api/owners/:id/cases (get owner's cases)
- Implement GET /api/pets (list)
- Implement POST /api/pets (create)
- Implement GET /api/pets/:id (detail)
- Implement PUT /api/pets/:id (update)
- Implement duplicate owner detection by phone
- Create OwnerService and PetService
- Add integration tests

## Acceptance Criteria

- [ ] GET /api/owners returns paginated list with search support
- [ ] POST /api/owners creates owner with name, phone, email, address
- [ ] Email and phone are validated with proper format
- [ ] Phone uniqueness check: if phone exists, return existing owner with warning
- [ ] GET /api/owners/:id returns owner with all fields
- [ ] PUT /api/owners/:id updates owner information
- [ ] GET /api/owners/:id/cases returns all cases for owner
- [ ] GET /api/pets returns list of all pets
- [ ] POST /api/pets creates pet with owner_id, name, species, breed, age
- [ ] GET /api/pets/:id returns pet with owner relationship populated
- [ ] PUT /api/pets/:id updates pet information
- [ ] Pet records linked to owner via owner_id
- [ ] All endpoints require authentication
- [ ] Integration tests pass for all operations

## Inputs

- Owner and Pet schemas from database schema
- API specification from `.specify/spec/main.md`

## Outputs

- Owner controller (`backend/src/controllers/owners.controller.ts`)
- Owner service (`backend/src/services/owners.service.ts`)
- Pet controller (`backend/src/controllers/pets.controller.ts`)
- Pet service (`backend/src/services/pets.service.ts`)
- DTOs for owners and pets
- Integration tests

## Dependencies

- Task-004 (Case CRUD)
- Task-003 (Authentication)
- Task-002 (Database Schema)

## Technical Notes

**Owner Search**:
- By name: Partial match, case-insensitive
- By phone: Exact or partial match
- By email: Exact match
- Example: GET /api/owners?search=john

**Pet Species Support**:
- Dog, Cat, Rabbit, Guinea Pig, Hamster, Bird, Reptile, Other

**Owner-Case Relationship**:
- Owner can have multiple cases
- Each case has one owner
- Cases should be sorted by created_at DESC

**Duplicate Detection Logic**:
```
When creating owner:
  IF phone_exists THEN
    Return existing owner with status 202 (Accepted)
    Suggest linking to existing case
  ELSE
    Create new owner
    Return 201 (Created)
```

## Success Criteria

✓ Owners and pets are properly linked
✓ Duplicate detection works correctly
✓ All CRUD operations function
✓ Search and filtering work properly
