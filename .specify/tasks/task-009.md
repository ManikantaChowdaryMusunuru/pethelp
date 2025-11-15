---
id: task-009
title: "Search & Filtering System"
category: "Case Management"
priority: "P2"
estimated_hours: 8
---

## Task Overview

Implement global search and advanced filtering across cases, owners, and pets.

## Description

Create efficient search functionality allowing staff to quickly find cases and owners using multiple criteria.

**Scope**:
- Implement GET /api/search (global search)
- Implement GET /api/search/cases (case-specific search)
- Implement GET /api/search/owners (owner-specific search)
- Support search by case ID, owner name, phone, pet name
- Implement date range filtering
- Implement status filtering
- Implement service type filtering
- Implement assigned staff filtering
- Create search indexes for performance
- Add search result ranking

## Acceptance Criteria

- [ ] GET /api/search?q=term returns results from all entities
- [ ] Case search by case_id, owner name, owner phone, pet name
- [ ] Results return in < 1 second for typical queries
- [ ] Filtering by status: GET /api/cases?status=In%20Progress
- [ ] Filtering by service_type: GET /api/cases?service_type=Medical
- [ ] Filtering by date range: GET /api/cases?created_from=2025-11-01&created_to=2025-11-30
- [ ] Filtering by assigned staff: GET /api/cases?assigned_to=user-123
- [ ] Multiple filters can be combined
- [ ] Search is case-insensitive
- [ ] Partial phone matches supported
- [ ] Results are paginated (default 20 per page)
- [ ] Database indexes on search fields exist

## Inputs

- Search requirements from spec and user stories
- Performance targets from plan

## Outputs

- Search controller (`backend/src/controllers/search.controller.ts`)
- Search service with optimized queries
- Database migration to add search indexes
- Integration tests

## Dependencies

- Task-004 (Case CRUD)
- Task-005 (Owner/Pet Management)

## Technical Notes

**Search Index Strategy**:
```sql
CREATE INDEX idx_owner_name ON owners USING GIN(to_tsvector('english', name));
CREATE INDEX idx_owner_phone ON owners(phone);
CREATE INDEX idx_pet_name ON pets USING GIN(to_tsvector('english', name));
CREATE INDEX idx_case_status ON cases(status);
CREATE INDEX idx_case_service_type ON cases(service_type);
```

**Query Optimization**:
- Use EXPLAIN ANALYZE to verify index usage
- Avoid N+1 queries with eager loading
- Use database-level full-text search where possible
- Cache frequent searches (Redis)

**Search Example Queries**:
```
GET /api/search/cases?q=john&status=In%20Progress
GET /api/search/owners?phone=555
GET /api/search/cases?service_type=Medical,Behavioral
GET /api/cases?created_from=2025-11-01&created_to=2025-11-30&assigned_to=user-123
```

**Result Ranking**:
- Exact matches rank higher than partial
- Recent matches rank higher than old
- Based on relevance score

## Success Criteria

✓ Search returns results quickly
✓ Filtering works across criteria
✓ Indexes are effective
✓ Results are accurate and relevant
