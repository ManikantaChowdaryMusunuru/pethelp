---
id: task-018
title: "API Integration Tests & Documentation"
category: "Infrastructure"
priority: "P2"
estimated_hours: 12
---

## Task Overview

Implement comprehensive integration tests and API documentation for backend endpoints.

## Description

Create integration test suite covering all API endpoints and document API for frontend developers and external users.

**Scope**:
- Create integration tests for all API endpoints
- Test authentication and RBAC
- Test data validation and error cases
- Test edge cases and boundary conditions
- Create API documentation (Swagger/OpenAPI)
- Document all endpoints with examples
- Document request/response schemas
- Document error codes and messages
- Create API testing utility functions
- Set up test database fixtures

## Acceptance Criteria

- [ ] Integration tests cover all API endpoints
- [ ] Tests verify authentication is required
- [ ] Tests verify RBAC permissions enforced
- [ ] Tests verify data validation (required fields, formats)
- [ ] Tests verify error responses (400, 401, 403, 404, 500)
- [ ] Tests verify edge cases (empty lists, null fields, boundaries)
- [ ] Test database fixtures populate sample data
- [ ] All tests pass and provide clear failure messages
- [ ] Test coverage is >= 80% for API layer
- [ ] API documentation exists in Swagger/OpenAPI format
- [ ] All endpoints documented with request/response examples
- [ ] Error responses documented with codes and messages
- [ ] Documentation includes authentication requirements
- [ ] Documentation includes rate limiting if applicable

## Inputs

- All API endpoints from backend tasks
- API requirements from plan
- Test frameworks (Jest, Supertest)

## Outputs

- Integration test suite (`backend/tests/integration/`)
- API documentation file (`backend/docs/api.md` or `api.yaml`)
- Swagger UI configuration
- Test utilities and fixtures (`backend/tests/fixtures/`)
- Postman collection for manual testing (optional)
- Test execution report

## Dependencies

- All backend endpoint tasks (004-012)
- Task-001 (Project Structure)

## Technical Notes

**Integration Test Structure**:
```typescript
describe('Cases API', () => {
  describe('GET /api/cases', () => {
    it('should return cases for authenticated user', async () => {
      const res = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      await request(app).get('/api/cases').expect(401);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/cases?status=New')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      res.body.data.forEach(c => expect(c.status).toBe('New'));
    });
  });
});
```

**Test Database Setup**:
- Separate test database (in-memory SQLite or test PostgreSQL)
- Fixtures seed data before each test
- Cleanup/teardown after each test
- Isolated tests that don't affect each other

**Test Fixtures**:
- Sample users (staff, case manager, admin)
- Sample owners and pets
- Sample cases with various statuses
- Sample service assignments

**API Documentation** (Swagger/OpenAPI):
```yaml
/api/cases:
  get:
    summary: List cases
    description: Retrieve paginated list of cases
    parameters:
      - name: status
        in: query
        schema:
          type: string
          enum: ['New', 'In Progress', 'On Hold', 'Closed']
    responses:
      200:
        description: List of cases
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: '#/components/schemas/Case'
      401:
        description: Unauthorized
      403:
        description: Forbidden
```

**Error Response Format** (consistent):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**API Error Codes**:
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_FAILED`: Invalid credentials
- `UNAUTHORIZED`: No authentication provided
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Duplicate resource
- `SERVER_ERROR`: Internal server error

## Success Criteria

✓ All API endpoints have passing tests
✓ Error cases are tested
✓ RBAC is enforced
✓ API documentation is complete and accurate
