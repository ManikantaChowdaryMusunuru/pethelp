---
id: task-007
title: "File Upload & Preview Functionality"
category: "Case Management"
priority: "P1"
estimated_hours: 10
---

## Task Overview

Implement file upload, storage, preview, and management capabilities for case documents.

## Description

Create endpoints and services for uploading files to cases, storing them securely, generating previews, and managing file lifecycle.

**Scope**:
- Implement POST /api/cases/:id/files (file upload)
- Implement GET /api/cases/:id/files (list files)
- Implement GET /api/files/:id/download (download file)
- Implement GET /api/files/:id/preview (preview file)
- Implement DELETE /api/files/:id (delete file)
- Set up file storage (AWS S3 or local filesystem)
- Implement file type validation
- Implement file size validation (max 50MB)
- Generate file previews for images and PDFs
- Store file metadata in database
- Add file access logging

## Acceptance Criteria

- [ ] POST /api/cases/:id/files accepts multipart file upload
- [ ] File size validation: reject files > 50MB
- [ ] File type validation: only allow PDF, images, documents
- [ ] File stored with name: {case_id}_{timestamp}_{original_filename}.{ext}
- [ ] File metadata stored in case_files table
- [ ] GET /api/cases/:id/files returns list with filename, size, upload date
- [ ] GET /api/files/:id/download returns file for download
- [ ] GET /api/files/:id/preview generates preview for images/PDFs
- [ ] Image preview is served as image or thumbnail
- [ ] PDF preview accessible via browser viewer
- [ ] DELETE /api/files/:id marks file as archived
- [ ] File access is logged to audit trail
- [ ] Storage location configured via environment variable
- [ ] Integration tests verify upload/download/preview

## Inputs

- File management requirements from spec
- Storage configuration from plan

## Outputs

- File controller (`backend/src/controllers/files.controller.ts`)
- File service (`backend/src/services/files.service.ts`)
- Storage adapter (`backend/src/services/storage.adapter.ts`)
- File type validator utilities
- Integration tests

## Dependencies

- Task-004 (Case CRUD)
- Task-003 (Authentication)
- Task-002 (Database Schema)

## Technical Notes

**File Storage Options**:
1. **Development**: Local filesystem (`./uploads/`)
2. **Production**: AWS S3 with versioning and encryption

**Supported File Types**:
- Images: JPEG, PNG, GIF, WEBP (max 10MB)
- Documents: PDF, DOC, DOCX, TXT (max 50MB)
- Spreadsheets: XLS, XLSX, CSV (max 50MB)

**File Naming Strategy**:
- Pattern: `{case_id}/{timestamp}_{uuid}_{sanitized_filename}.{ext}`
- Example: `case-123e/1731610200_9f3b2a1c_intake_form.pdf`
- Prevents conflicts and enables easy organization by case

**Preview Generation**:
- Images: Generate thumbnail (200x200px) via ImageMagick or similar
- PDFs: Use pdf-lib to extract first page as image
- Documents: Preview filename/metadata only
- Cache previews for 24 hours

**Storage Interface** (for S3/local abstraction):
```typescript
interface StorageAdapter {
  upload(filePath: string, buffer: Buffer): Promise<string>
  download(filePath: string): Promise<Buffer>
  delete(filePath: string): Promise<void>
  generatePreview(filePath: string): Promise<Buffer>
}
```

**Error Handling**:
- File too large: 413 Payload Too Large
- Invalid file type: 400 Bad Request with allowed types
- Storage full: 507 Insufficient Storage
- File not found: 404 Not Found

## Success Criteria

✓ Files upload successfully
✓ File metadata is stored
✓ Files can be downloaded
✓ Previews generate correctly
✓ File access is controlled and logged
