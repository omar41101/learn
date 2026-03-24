# FLAS Platform - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLAS Learning Platform                      │
│                   (Database-Integrated)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (Browser)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  index.html      student.html    exercise.html    teacher.html │
│  (Home)          (Dashboard)     (Practice)       (Manage)      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │            api-utils.js (API Client Library)              │ │
│  │  - Authentication (login, register, logout)              │ │
│  │  - Exercise management (get, create, update, delete)     │ │
│  │  - Progress tracking (get, update scores)                │ │
│  │  - Results handling (submit, retrieve)                   │ │
│  │  - Diagnosis management                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    HTTP/HTTPS │ JSON
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                   BACKEND APPLICATION LAYER                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Express.js Server (server.js)                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Middleware:                                              │  │
│  │ - CORS (Cross-Origin Resource Sharing)                  │  │
│  │ - Body Parser (JSON processing)                         │  │
│  │ - Static Files (serve HTML/CSS/JS)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  API Routes:                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ /api/users        (Authentication & Profiles)           │  │
│  │ /api/exercises    (Exercise CRUD)                       │  │
│  │ /api/progress     (Progress Tracking)                   │  │
│  │ /api/results      (Results & Statistics)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    TCP/IP     │ SQL
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                   DATABASE LAYER (PostgreSQL)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Connection Pool (db.js) - Efficient connection management    │
│                                                                 │
│  Tables:                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ users            - User accounts (student, teacher, guest)│ │
│  │ levels           - Learning levels (1-4)                 │  │
│  │ exercises        - Exercise content & metadata           │  │
│  │ user_progress    - Per-level tracking                    │  │
│  │ exercise_results - Per-exercise submissions              │  │
│  │ diagnosis_results- Diagnostic test results              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Indexes: Optimized queries on frequently searched columns    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Student Taking an Exercise

```
1. Student Opens Exercise Page
   │
   ├─→ Browser requests: GET /api/exercises/level/1
   │
   ├─→ Server queries: SELECT * FROM exercises WHERE level_id = 1
   │
   ├─→ Database returns exercises
   │
   ├─→ Exercise displayed to student
   │
2. Student Submits Answer
   │
   ├─→ Browser sends: POST /api/results/submit
   │   {user_id, exercise_id, score, user_answer, is_correct}
   │
   ├─→ Server validates answer
   │
   ├─→ Inserts result: INSERT INTO exercise_results (...)
   │
   ├─→ Updates progress: UPDATE user_progress
   │
   ├─→ Returns result
   │
3. Student Sees Feedback
   │
   └─→ Score updated, progress saved to database
```

---

## Authentication Flow

```
User Registration:
  User Input (username, email, password)
         ↓
  POST /api/users/register
         ↓
  Server validates input
         ↓
  Hash password with bcrypt
         ↓
  INSERT INTO users (username, email, password_hash, user_type)
         ↓
  Generate JWT token
         ↓
  Return token + user data
         ↓
  Frontend stores in localStorage


User Login:
  User Input (username, password)
         ↓
  POST /api/users/login
         ↓
  SELECT * FROM users WHERE username = ?
         ↓
  Compare password with bcrypt
         ↓
  Generate JWT token
         ↓
  Return token + user data
         ↓
  Frontend stores token
         ↓
  Use token in API requests: Authorization: Bearer {token}


Protected Routes:
  Request with Authorization header
         ↓
  Server verifies JWT token
         ↓
  Extract userId from token
         ↓
  Process request
         ↓
  Return data
```

---

## Database Schema Relationships

```
users
  ├─→ (has many) user_progress
  ├─→ (has many) exercise_results
  └─→ (has many) diagnosis_results

levels
  ├─→ (has many) exercises
  └─→ (has many) user_progress

exercises
  └─→ (has many) exercise_results

user_progress
  ├─→ belongs_to user
  └─→ belongs_to level

exercise_results
  ├─→ belongs_to user
  ├─→ belongs_to exercise
  └─→ belongs_to level

diagnosis_results
  └─→ belongs_to user
```

---

## API Call Sequence Example

### Complete Exercise

```
Frontend                          Backend                  Database
   │                                 │                        │
   │─── POST /api/results/submit ─→  │                        │
   │     {user_id: 5,                 │                        │
   │      exercise_id: 12,            │                        │
   │      level_id: 1,                │                        │
   │      score: 10,                  │                        │
   │      is_correct: true}           │                        │
   │                                  │                        │
   │                                  ├─→ INSERT exercise_results
   │                                  │   VALUES (5,12,1,10...)─→ ✓
   │                                  │                        │
   │                                  ├─→ SELECT user_progress 
   │                                  │   WHERE user_id=5...  ←─ Row
   │                                  │                        │
   │                                  ├─→ UPDATE user_progress
   │                                  │   SET score=150...    ←─ ✓
   │                                  │                        │
   │ ← {success: true, result}        │←                       │
   │
Display success message
Update UI with new score
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────┐
│            Internet Users                  │
│         (Any Browser/Device)               │
└────────────────┬─────────────────────────┘
                 │
                 │ HTTPS
                 │
        ┌────────▼─────────┐
        │   Load Balancer  │
        │   (Optional)     │
        └────────┬─────────┘
                 │
        ┌────────▼─────────────────┐
        │   Node.js Server(s)      │
        │  (Multiple instances)    │
        │  ├─ server.js            │
        │  └─ API routes           │
        └────────┬─────────────────┘
                 │
        ┌────────▼──────────────────┐
        │   Connection Pool         │
        │  (Persistent connections) │
        └────────┬──────────────────┘
                 │
        ┌────────▼─────────────┐
        │   PostgreSQL Server  │
        │  ├─ Database         │
        │  ├─ Users table      │
        │  ├─ Exercises table  │
        │  └─ Results table    │
        └──────────────────────┘
```

---

## File Organization

```
flas/ (Root Directory)
│
├── Backend Files
│   ├── server.js              (Main Express app)
│   ├── db.js                  (Database connection)
│   ├── package.json           (Dependencies)
│   ├── setup-database.js      (Init script)
│   ├── reset-database.js      (Reset script)
│   └── routes/                (API endpoints)
│       ├── users.js
│       ├── exercises.js
│       ├── progress.js
│       └── results.js
│
├── Frontend Files
│   ├── index.html             (Home page)
│   ├── student.html           (Dashboard)
│   ├── exercise.html          (Exercise page)
│   ├── diagnosis.html         (Diagnostic test)
│   ├── teacher.html           (Teacher panel)
│   ├── script.js              (Shared functions)
│   ├── style.css              (Styling)
│   └── api-utils.js          (API client)
│
├── Configuration
│   ├── .env                   (Secrets - not in git)
│   └── .env.example           (Template)
│
└── Documentation
    ├── README.md
    ├── SETUP_GUIDE.md
    ├── INTEGRATION_GUIDE.md
    ├── QUICK_REFERENCE.md
    ├── INSTALLATION_SUMMARY.md
    └── ARCHITECTURE.md (this file)
```

---

## Technology Stack

```
Frontend:
  ├─ HTML5 (Markup)
  ├─ CSS3 (Styling)
  ├─ JavaScript (ES6+)
  └─ Font Awesome (Icons)

Backend:
  ├─ Node.js (Runtime)
  ├─ Express.js (Web framework)
  ├─ PostgreSQL (Database)
  ├─ bcryptjs (Password hashing)
  ├─ JSON Web Tokens (Authentication)
  └─ CORS (Cross-origin support)

Tools:
  ├─ npm (Package manager)
  ├─ nodemon (Development)
  ├─ PostgreSQL client
  └─ Git (Version control)
```

---

## Request/Response Example

### `POST /api/results/submit`

**Request:**
```json
{
  "user_id": 5,
  "exercise_id": 12,
  "level_id": 1,
  "score": 10,
  "is_correct": true,
  "user_answer": {
    "selected": "A",
    "timestamp": "2026-02-17T10:30:00Z"
  }
}
```

**Processing:**
```javascript
1. Validate input
2. Check user exists
3. Create attempt record
4. Calculate attempts
5. INSERT into exercise_results
6. Query current progress
7. UPDATE user_progress
8. Generate response
```

**Response:**
```json
{
  "id": 456,
  "user_id": 5,
  "exercise_id": 12,
  "level_id": 1,
  "score": 10,
  "attempts": 2,
  "is_correct": true,
  "user_answer": {...},
  "completed_at": "2026-02-17T10:30:45Z"
}
```

---

## Performance Considerations

```
Database Optimization:
  ├─ Indexes on user_id, level_id, exercise_id
  ├─ Connection pooling (default 10 connections)
  ├─ Parameterized queries (prevent SQL injection)
  └─ JSONB for complex data (fast querying)

Backend Optimization:
  ├─ CORS caching
  ├─ Static file serving
  ├─ Error handling
  └─ Request validation

Frontend Optimization:
  ├─ API utility caching
  ├─ localStorage for tokens
  ├─ Efficient DOM updates
  └─ Responsive design
```

---

## Monitoring & Logging

```
What to Monitor:
  ├─ Database connections
  ├─ API response times
  ├─ Error rates
  ├─ User count
  ├─ System resources
  └─ Backup status

Logs Location:
  ├─ Server logs → Terminal output
  ├─ Database logs → PostgreSQL logs
  ├─ Browser logs → DevTools console
  └─ Error logs → Error messages
```

---

## Security Architecture

```
Layers:
  1. HTTPS/SSL - Encrypted transmission
  2. CORS - Origin verification
  3. JWT - Token-based auth
  4. Bcrypt - Password hashing
  5. Input validation - Prevent injection
  6. SQL parameters - Prevent SQL injection
  7. Error handling - No sensitive info leaks
  8. Environment variables - Secret management
```

---

## Scalability Plan

```
Current (Single Server):
  └─ Node.js + PostgreSQL

Horizontal Scaling:
  ├─ Multiple Node.js instances
  ├─ Load balancer (nginx/HAProxy)
  └─ Shared PostgreSQL (single DB)

Vertical Scaling:
  ├─ Upgrade server CPU/RAM
  ├─ Connection pool optimization
  └─ Database query optimization

Advanced:
  ├─ Database replication (primary-replica)
  ├─ Caching layer (Redis)
  ├─ CDN for static files
  ├─ Database sharding
  └─ Microservices (future)
```

---

**Created:** February 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
