---
id: task-010
title: "Data Import & Migration System"
category: "Data Ingestion"
priority: "P1"
estimated_hours: 12
---

## Task Overview

Implement data import capability for migrating historical case data from WaitWhile system to PHCS.

## Description

Create import system with data validation, deduplication, and audit logging to safely migrate 500+ existing cases from legacy systems.

**Scope**:
- Implement POST /api/admin/import (import endpoint)
- Create data mapper for WaitWhile format → PHCS schema
- Implement validation engine (required fields, formats)
- Implement deduplication logic
- Create import staging area
- Implement transaction rollback on error
- Create import audit trail
- Implement import preview/review flow
- Implement batch import processing
- Add import status tracking and reporting

## Acceptance Criteria

- [ ] POST /api/admin/import accepts CSV or JSON file from WaitWhile
- [ ] Data mapper transforms WaitWhile fields to PHCS schema
- [ ] Validation checks: required fields, formats (email, phone), date ranges
- [ ] Records with validation errors reported with details
- [ ] Deduplication: matches existing owners by phone + name fuzzy
- [ ] Import preview shows X valid, Y warnings, Z errors before confirmation
- [ ] Admin can approve or abort import
- [ ] Approved imports execute within single transaction
- [ ] Failed import rolls back all changes (no partial data)
- [ ] Import creates audit entries for all imported records
- [ ] Existing cases not affected by import
- [ ] Import history accessible via admin endpoint
- [ ] 500+ records import in < 5 minutes
- [ ] Integration tests verify import correctness

## Inputs

- WaitWhile export format specification
- Case data from legacy system
- Schema mapping requirements

## Outputs

- Import controller (`backend/src/controllers/import.controller.ts`)
- Import service (`backend/src/services/import.service.ts`)
- Data mapper (`backend/src/services/mappers/waitwhile.mapper.ts`)
- Validator service (`backend/src/services/validators/import.validator.ts`)
- Import staging table (database)
- Integration tests

## Dependencies

- Task-003 (Authentication)
- Task-002 (Database Schema)
- Task-001 (Project Structure)

## Technical Notes

**Import Workflow**:
1. Admin uploads WaitWhile export file
2. System validates and maps data to staging table
3. Deduplication logic identifies existing owners
4. Preview report generated: valid count, warnings, errors
5. Admin reviews and approves
6. Import executes in transaction
7. If success: records moved to production tables, marked with source="waitwhile_import"
8. If error: entire transaction rolls back, no partial data
9. Audit trail created for all imported records

**Data Mapping Example**:
```
WaitWhile → PHCS
waitwhile_id → external_id (tracking)
client_name → owner.name
client_phone → owner.phone
pet_name → pet.name
request_date → case.created_at
status → case.status (mapping New/Active/Closed)
request_type → case.service_type
```

**Deduplication Logic**:
```
For each owner in import:
  IF (owner.phone matches existing) THEN
    IF (fuzzy_name_match AND same_pet) THEN
      Link to existing owner
    ELSE
      Create new owner (same phone but different person)
  ELSE
    Create new owner
```

**Staging Table** (`import_staging`):
- Holds raw import records temporarily
- Separate from production data
- Dropped after successful import
- Helps with rollback capability

**Import Validation**:
- Required: owner name, service type
- Optional: phone (warn if missing), email, pet name
- Format: phone must be valid format
- Format: email must be valid format
- Date must be within reasonable range (not future, not > 5 years old)

## Success Criteria

✓ Historical data imports successfully
✓ Deduplication prevents duplicates
✓ All changes are auditable
✓ Import is atomic (all or nothing)
