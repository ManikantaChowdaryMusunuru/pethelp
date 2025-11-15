# Pet Help Center Case Management System (PHCS)

## 🚀 Quick Start - 2 Minutes

### Option 1: Run Locally (Recommended for Development)

```bash
# 1. Backend setup
cd backend
npm install
npm run dev
# Backend running on http://localhost:3001

# 2. In a new terminal - Frontend setup
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:3000
```

### Option 2: Docker Compose

```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## 🔐 Login Credentials

**Demo Account:**
- Email: `demo@jhs.org`
- Password: `demo123`

---

## 📋 Features Included

✅ **Case Management**
- Create new cases with owner & pet info
- View all cases with real-time filtering
- Update case status (New → In Progress → On Hold → Closed)
- Soft delete with archive functionality

✅ **Case Details**
- Owner and pet information
- Case timeline and status history
- Add notes to cases
- Upload and download files

✅ **Notes & Collaboration**
- Add timestamped notes to cases
- View full note history
- Automatic attribution to staff member

✅ **File Management**
- Upload documents (PDF, images, docs)
- Download attachments
- File metadata tracking

✅ **Responsive Design**
- Works on desktop, tablet, mobile
- Clean, modern UI with Tailwind CSS
- Dark theme support ready

---

## 🏗️ Project Structure

```
pethelp/
├── backend/                    # Node.js/Express API
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── Dockerfile
│   ├── uploads/               # File storage
│   └── phcs.db               # SQLite database
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── context/           # Auth context
│   │   ├── services/          # API calls
│   │   ├── styles/            # CSS
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | SQLite (local) or PostgreSQL (production) |
| File Storage | Local filesystem (or AWS S3 in production) |
| Auth | Session-based (JWT ready) |
| Deployment | Docker + Vercel/Render |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Cases
- `GET /api/cases` - List all cases
- `GET /api/cases?status=New` - Filter by status
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get case detail
- `PUT /api/cases/:id` - Update case

### Notes
- `POST /api/cases/:id/notes` - Add note
- `GET /api/cases/:id/notes` - Get notes

### Files
- `POST /api/cases/:id/files` - Upload file
- `GET /api/cases/:id/files` - List files
- `GET /api/files/:id/download` - Download file

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard data

---

## 🚀 Deployment

### Deploy Backend (Render)

1. Push to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variable: `DATABASE_PATH=./phcs.db`
8. Deploy!

### Deploy Frontend (Vercel)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your project
4. Select the `frontend` folder as root
5. Add environment: `VITE_API_URL=https://your-backend.onrender.com`
6. Deploy!

---

## 📝 Database Schema

The system uses SQLite with the following tables:

- **users** - Staff accounts (email, password, role)
- **owners** - Pet owners (name, phone, email, address)
- **pets** - Pet information (name, species, breed, age, health notes)
- **cases** - Case records (owner, pet, status, service type, dates)
- **case_notes** - Timestamped notes on cases
- **case_files** - Uploaded documents attached to cases
- **service_assignments** - Track services assigned to coordinators

---

## 🎯 Demo Walkthrough (5 Minutes)

1. **Login** (30 sec)
   - Use demo@jhs.org / demo123
   - See dashboard with case counts

2. **Create Case** (1 min)
   - Click "+ New Case"
   - Fill owner & pet info
   - Select service type
   - Submit → case appears in list

3. **View Case** (1.5 min)
   - Click on case in table
   - See owner/pet details
   - Add a note
   - Upload a file

4. **Update Status** (1 min)
   - Change status dropdown
   - See case move through workflow

5. **Filter & Search** (30 sec)
   - Use status filters
   - Show filtering works

---

## 🛠️ Development Tips

### Add a New Page

1. Create file in `frontend/src/pages/YourPage.jsx`
2. Add route to `frontend/src/App.jsx`
3. Use `useAuth()` hook for auth info
4. Use `api.get()` / `api.post()` for API calls

### Add a New API Endpoint

1. Add handler in `backend/server.js`
2. Use `dbGet()`, `dbAll()`, `dbRun()` for database
3. Test with `curl` or Postman

### Update Database Schema

1. Edit table creation in `backend/server.js` `initDatabase()`
2. Rename `phcs.db` to force re-initialization
3. Or use migrations for production

---

## 🐛 Troubleshooting

**Frontend won't connect to backend**
- Check backend is running on :3001
- Verify `VITE_API_URL` environment variable
- Check CORS is enabled (it is by default)

**File upload fails**
- Ensure `backend/uploads/` directory exists
- Check file size < 50MB
- Verify file type is allowed

**Database errors**
- Delete `backend/phcs.db` to reset
- Check `backend/.env` has correct `DATABASE_PATH`

**Port already in use**
- Change port in `backend/.env` or `frontend/vite.config.js`
- Kill process: `lsof -i :3000` or `lsof -i :3001`

---

## 📞 Support

For hackathon demo help:
- Check console for errors (F12)
- Verify all containers running: `docker ps`
- Restart everything: `docker-compose restart`

---

## 🎉 What's Next (Phase 2)

- [ ] Role-based access control (RBAC)
- [ ] Service coordinator assignments
- [ ] Real-time reporting & dashboards
- [ ] Data import from WaitWhile
- [ ] Mobile app support
- [ ] Email notifications
- [ ] Audit logging
- [ ] Multi-location support

---

**Ready to present tomorrow!** 🚀
