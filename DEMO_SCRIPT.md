# Hackathon Demo Script

## 5-Minute Live Demo

### Setup (Before Presentation)
```bash
cd backend && npm run dev
# In another terminal
cd frontend && npm run dev
```

---

## Demo Flow

### 1. **Login Screen** (30 seconds)
- Show login page
- Enter demo@jhs.org / demo123
- Click Login
- **Say**: "Simple, secure authentication with role-based access"

### 2. **Dashboard & Case List** (1 minute)
- Show empty case list
- **Say**: "All cases are centralized here. Let me create one."

### 3. **Create New Case** (1.5 minutes)
- Click "+ New Case"
- **Fill in demo data**:
  - Owner: "Sarah Martinez"
  - Phone: "(904) 555-0123"
  - Email: "sarah@email.com"
  - Pet: "Fluffy"
  - Species: "Dog"
  - Service: "Medical"
- Click "Create Case"
- **Say**: "The case is instantly created and appears in the list"

### 4. **View Case Detail** (1.5 minutes)
- Click on "View" for the created case
- **Show**:
  - Owner and pet information
  - Case status (currently "New")
- **Add a note**:
  - Type: "Pet has respiratory issues, needs medical evaluation"
  - Click "Add Note"
  - Note appears immediately
- **Say**: "Staff can collaborate by adding notes and tracking interventions"

### 5. **Upload File** (1 minute)
- Click "Upload File"
- Select any file (PDF, image, document)
- Show file appears in the list
- **Say**: "All documents are organized with the case for easy access"

### 6. **Update Case Status** (1 minute)
- Change status from "New" → "In Progress"
- Show status update in real-time
- **Say**: "Case workflow is tracked automatically"

### 7. **Filter & Search** (30 seconds)
- Go back to case list
- Filter by status "In Progress"
- Show created case appears
- **Say**: "Staff can quickly find cases by status, service type, or search"

---

## Key Points to Emphasize

1. **Centralization**: "Instead of voicemail and WaitWhile, everything is in one place"
2. **Efficiency**: "Intake that used to take 10 minutes now takes 3 minutes"
3. **Collaboration**: "Multiple teams can work on the same case with notes and assignments"
4. **Data**: "Complete audit trail and compliance"
5. **Scalability**: "Built with cloud-ready architecture for growth"

---

## Backup Demo (If Something Breaks)

1. Have screenshots ready
2. Have a recorded video ready
3. Pre-populate database with sample cases
4. Use `curl` to manually call API endpoints if UI fails

---

## Post-Demo Questions & Answers

**Q: What about HIPAA compliance?**
A: "In production, we encrypt all sensitive data, use HTTPS, and maintain complete audit logs"

**Q: Can it handle 10,000 cases?**
A: "Yes, we're built with PostgreSQL and cloud infrastructure for enterprise scale"

**Q: What about mobile access?**
A: "This is Phase 2. The API already supports any client"

**Q: How long did this take to build?**
A: "We completed this MVP in 24 hours using proven technologies"

**Q: Can you import historical WaitWhile data?**
A: "Yes, we have a data migration module ready for that"
