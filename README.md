# Rural Talent Scouting Network

> **Discover Talent. Develop Potential. Create Opportunities.**

An AI-assisted platform that helps identify promising young athletes from rural areas, connect them with training opportunities, and guide them toward relevant sports trials and programmes.

---

## Problem Statement

Millions of talented young athletes in rural India never get noticed — not because they lack ability, but because talent identification depends on physical access to competitions, coaches, academies, and scouts.

## Solution

A full-stack web platform that:
- Enables school-level fitness testing by PE teachers
- Generates preliminary AI-assisted performance assessments
- Creates digital athlete profiles with progress tracking
- Matches athletes to relevant government opportunities, trials, and scholarships
- Gives scouts visibility into rural talent
- Connects athletes to nearby clubs and Khelo India Centres

**AI = screening and recommendation. Coach/Scout/Government authority = final evaluation and selection.**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Recharts |
| Backend | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT |
| AI Service | Python, FastAPI (preliminary scoring engine) |
| File Storage | Local uploads (Cloudinary-ready abstraction) |

---

## Project Structure

```
sih/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express API
├── ai-service/        # Python FastAPI scoring service
├── uploads/           # File uploads
└── docker-compose.yml
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.11+ (for AI service, optional)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit MONGODB_URI and JWT_SECRET
npm run dev            # Starts on port 5000
```

Seed demo data:
```bash
npm run seed
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # Starts on port 5173
```

### 3. AI Service (optional)

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Docker (all services)

```bash
docker-compose up --build
```

---

## Demo Accounts

All accounts use password: **Demo@123456**

| Role | Email |
|------|-------|
| Student | student@demo.com |
| PE Teacher | teacher@demo.com |
| Scout | scout@demo.com |
| Government Org | gov@demo.com |
| Club | club@demo.com |
| Admin | admin@demo.com |

---

## Demo Flow

1. **Login as teacher@demo.com** → Add Fitness Test → Enter student@demo.com, Sprint, 100m = 14.2s → Submit
2. **Login as student@demo.com** → Dashboard shows AI score 84, Potential Flagged → Opportunities tab shows 94% match for District Trial
3. **Apply** to District Athletics Selection Trial
4. **Login as scout@demo.com** → Athlete Discovery → Find Rahul Kumar → View profile → Shortlist
5. **Login as admin@demo.com** → Verifications → Approve pending opportunities

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/students | List students (Scout/Admin/Teacher) |
| GET | /api/students/me | My profile (Student) |
| POST | /api/tests | Create fitness test (Teacher) |
| GET | /api/opportunities | List published opportunities |
| GET | /api/opportunities/matched | Personalized matches (Student) |
| POST | /api/opportunities/apply | Apply to opportunity (Student) |
| GET | /api/scouts/athletes | Discover athletes (Scout) |
| POST | /api/scouts/shortlist | Shortlist athlete (Scout) |
| GET | /api/admin/stats | Platform statistics (Admin) |
| PUT | /api/admin/verify/:id | Verify entity (Admin) |
| GET | /api/clubs | List clubs |
| GET | /api/kic | List Khelo India Centres |
| GET | /api/notifications | My notifications |

---

## Important Notes

- All demo data is clearly labelled **DEMO**
- AI assessments are labelled **"Preliminary AI-assisted assessment"**
- Platform is not affiliated with SAI or Khelo India unless officially configured
- Student privacy is protected — sensitive data not exposed publicly
- AI does not make final selection decisions

---

## Future Improvements

- Computer vision integration (MediaPipe + OpenCV) for video analysis
- Real government API integration (SAI, Khelo India)
- Offline-capable PWA for field use by PE teachers
- SMS/WhatsApp notifications for rural connectivity
- Multi-language support (Hindi, Kannada, Tamil, etc.)
- Advanced analytics and district-level reports
