---
id: task-001
title: "Project Structure & Dependencies Setup"
category: "Infrastructure"
priority: "P0"
estimated_hours: 4
---

## Task Overview

Initialize the complete project structure for PHCS with all required directories, configuration files, and dependencies installed.

## Description

Set up the foundational project structure for a full-stack Node.js/React application with TypeScript support, development tools, and testing frameworks. This task establishes the baseline that all other development work depends on.

**Scope**:
- Create backend directory structure (`backend/src/`, `backend/tests/`, etc.)
- Create frontend directory structure (`frontend/src/`, `frontend/public/`, etc.)
- Initialize Node.js backend project with package.json
- Initialize React frontend project with package.json or use Vite template
- Install all core dependencies (Express, TypeORM, React, etc.)
- Configure TypeScript for both backend and frontend
- Set up environment configuration files (.env.example)
- Configure ESLint and Prettier for code standards
- Set up Docker and Docker Compose for local development

## Acceptance Criteria

- [ ] Backend directory structure exists with all required subdirectories
- [ ] Frontend directory structure exists with all required subdirectories
- [ ] Backend `package.json` contains all core dependencies (express, typeorm, typescript, etc.)
- [ ] Frontend `package.json` contains all core dependencies (react, typescript, etc.)
- [ ] Backend can run with `npm start` locally
- [ ] Frontend can run with `npm start` locally
- [ ] Docker Compose file exists and starts both backend and frontend containers
- [ ] TypeScript compilation succeeds for both projects (`npm run build`)
- [ ] ESLint/Prettier configuration applies without errors
- [ ] Environment configuration file `.env.example` exists with all required variables

## Inputs

- Project requirements from `.specify/spec/main.md` and `.specify/plan/main.md`
- Technology stack decisions (Node.js 18.x, React 18.x, PostgreSQL 14.x, TypeScript 5.x)

## Outputs

- Complete project directory structure
- Backend project with all dependencies installed
- Frontend project with all dependencies installed
- Working Docker Compose setup for local development
- Configuration files (tsconfig.json, .eslintrc.json, .prettierrc, .env.example, Dockerfile, docker-compose.yml)
- README with setup and run instructions

## Dependencies

- None (foundational task)

## Technical Notes

**Backend Structure**:
```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/               # Configuration
│   ├── models/               # TypeORM entities
│   ├── services/             # Business logic
│   ├── controllers/          # API route handlers
│   ├── middleware/           # Express middleware
│   ├── utils/                # Utility functions
│   └── database/             # Database connection & migrations
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── contract/             # API contract tests
├── package.json
├── tsconfig.json
├── docker-compose.yml (at root)
├── Dockerfile
└── .env.example
```

**Frontend Structure**:
```
frontend/
├── src/
│   ├── index.tsx             # Entry point
│   ├── App.tsx               # Main app component
│   ├── components/           # Reusable components
│   ├── pages/                # Page components
│   ├── services/             # API services
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript types
│   └── styles/               # Global styles
├── public/
│   └── index.html            # HTML template
├── tests/                    # Component & integration tests
├── package.json
├── tsconfig.json
├── vite.config.ts or webpack.config.js
└── .env.example
```

**Key Dependencies**:

Backend:
- express: Web framework
- typeorm: ORM for database access
- pg: PostgreSQL driver
- jwt: JWT token generation/validation
- bcryptjs: Password hashing
- multer: File upload handling
- cors: CORS middleware
- dotenv: Environment variable management
- jest: Testing framework
- typescript: TypeScript compiler

Frontend:
- react: UI library
- react-router: Routing
- axios: HTTP client
- react-hook-form: Form management
- tailwindcss: CSS framework
- typescript: TypeScript compiler

## Success Criteria

✓ Both backend and frontend projects build successfully
✓ Both projects run locally without errors
✓ Docker Compose brings up both services
✓ Environment variables are properly configured
✓ Project structure matches architecture plan
