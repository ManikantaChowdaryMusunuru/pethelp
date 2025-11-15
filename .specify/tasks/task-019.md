---
id: task-019
title: "Deployment & DevOps Configuration"
category: "Infrastructure"
priority: "P2"
estimated_hours: 10
---

## Task Overview

Set up deployment infrastructure, CI/CD pipeline, and production configuration.

## Description

Configure deployment automation, monitoring, and operational readiness for production release.

**Scope**:
- Create Docker images for backend and frontend
- Set up Docker Compose for local development
- Configure environment variables for different environments
- Set up GitHub Actions CI/CD pipeline
- Implement automated testing in CI/CD
- Set up production server configuration
- Configure logging and monitoring
- Set up database backup strategy
- Create deployment documentation
- Set up health check endpoints

## Acceptance Criteria

- [ ] Docker images build successfully for backend and frontend
- [ ] Docker Compose brings up complete local stack
- [ ] Environment configuration supports dev/staging/prod
- [ ] GitHub Actions workflow triggers on push to main
- [ ] CI pipeline runs linting, tests, builds
- [ ] Deployment requires manual approval before production
- [ ] Backend has /health endpoint that returns status
- [ ] Frontend built as static files (optimized)
- [ ] Logging configured with structured JSON format
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Database backup script exists and is tested
- [ ] Deployment documentation exists (how to deploy)
- [ ] Database migrations run automatically on deploy

## Inputs

- Technology stack from plan (Node.js, React, PostgreSQL)
- Deployment targets (AWS, GCP, or on-premises)
- Team DevOps requirements

## Outputs

- Dockerfile for backend (`backend/Dockerfile`)
- Dockerfile for frontend (`frontend/Dockerfile`)
- Docker Compose file (`docker-compose.yml`)
- Environment configuration files (`.env.example`)
- GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Deployment guide (`docs/DEPLOYMENT.md`)
- Health check implementation
- Monitoring configuration

## Dependencies

- All backend services (tasks 004-012)
- Frontend build (task 014-017)

## Technical Notes

**Docker Configuration**:

Backend Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Frontend Dockerfile:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**GitHub Actions Workflow**:
```yaml
name: Deploy
on:
  push:
    branches: [main]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          echo "Deploying..."
          # AWS/GCP/other deployment commands
```

**Environment Variables**:

`.env.example`:
```
# Backend
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/phcs
JWT_SECRET=your-secret-key-here
FILE_STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./uploads

# Frontend
REACT_APP_API_URL=http://localhost:3000/api

# Production
LOG_LEVEL=info
SENTRY_DSN=https://...
```

**Health Check Endpoint**:
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected', // Check DB connection
    memory: process.memoryUsage()
  });
});
```

**Logging Configuration**:
- Structured JSON logging
- Log levels: debug, info, warn, error
- Include: timestamp, level, message, context
- Example: `{"timestamp": "2025-11-15T14:30:00Z", "level": "info", "message": "Case created", "case_id": "123"}`

**Backup Strategy**:
- Automated daily RDS snapshots (if using AWS)
- Or: pg_dump automated nightly backup with retention
- Cross-region replication for disaster recovery
- Test restore process regularly

**Monitoring**:
- CloudWatch for AWS (or equivalent for other platforms)
- Application Performance Monitoring (APM): New Relic, DataDog, or open-source
- Uptime monitoring: external health checks
- Alert thresholds: error rate > 5%, response time > 2s

## Success Criteria

✓ Docker builds work correctly
✓ CI/CD pipeline automates testing and building
✓ Deployment process is documented
✓ Monitoring is configured
✓ Backups are automated and tested
