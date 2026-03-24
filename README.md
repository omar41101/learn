# FLAS Interactive Learning Platform

A modern, interactive learning platform designed for Persian-speaking users with multi-level exercises, teacher dashboard, and student progress tracking.

## 🎯 Features

- ✅ **Student Dashboard**: Learn through interactive exercises across 4 levels
- ✅ **Diagnostic Test**: Automatic level assessment for new students
- ✅ **Multiple Exercise Types**: 
  - Multiple choice questions
  - Drag & drop activities
  - Matching exercises
  - Selection/identification tasks
  - Drawing/coloring activities
- ✅ **Teacher Panel**: Create, edit, and manage exercises
- ✅ **Progress Tracking**: Real-time student performance monitoring
- ✅ **Database Integration**: PostgreSQL backend with robust data persistence
- ✅ **Responsive Design**: Works on all devices (mobile, tablet, desktop)
- ✅ **RTL Support**: Full Arabic language support

## 🚀 Quick Start

### For Windows Users
```bash
cd c:\Users\omara\Downloads\wetransfer_flas_2026-02-17_1622\flas
quick-start.bat
```

### For Mac/Linux Users
```bash
cd ~/wetransfer_flas_2026-02-17_1622/flas
chmod +x quick-start.sh
./quick-start.sh
```

### Manual Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Database**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. **Set Up Database**
```bash
npm run setup
```

4. **Start Server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

5. **Open in Browser**
```
http://localhost:3000
```

## 📋 Requirements

- **Node.js** v14+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **npm** (included with Node.js)

## 📁 Project Structure

```
flas/
├── Backend
│   ├── server.js              # Express server
│   ├── db.js                  # Database connection
│   ├── package.json           # Dependencies
│   ├── setup-database.js      # Database initialization
│   ├── reset-database.js      # Database reset utility
│   └── routes/                # API endpoints
│       ├── users.js           # Auth & profile
│       ├── exercises.js       # Exercise CRUD
│       ├── progress.js        # User progress
│       └── results.js         # Results & stats
│
├── Frontend
│   ├── index.html             # Home page
│   ├── student.html           # Student levels
│   ├── exercise.html          # Exercise player
│   ├── diagnosis.html         # Diagnostic test
│   ├── teacher.html           # Teacher dashboard
│   ├── script.js              # Shared utilities
│   ├── style.css              # Styling
│   ├── api-utils.js          # API client library
│
├── Documentation
│   ├── SETUP_GUIDE.md         # Detailed setup guide
│   ├── README.md              # This file
│   ├── quick-start.bat        # Windows quick setup
│   └── quick-start.sh         # Mac/Linux quick setup
│
└── Configuration
    └── .env.example           # Environment template
```

## 🔐 Environment Variables

Create a `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flas_learning
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_secure_key_here

# Client
CLIENT_URL=http://localhost:3000
```

## 📚 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:userId` - Get user profile

### Exercises
- `GET /api/exercises/level/:levelId` - Get exercises for level
- `GET /api/exercises/:exerciseId` - Get exercise details
- `POST /api/exercises` - Create new exercise (teacher)
- `PUT /api/exercises/:exerciseId` - Update exercise (teacher)
- `DELETE /api/exercises/:exerciseId` - Delete exercise (teacher)

### Progress
- `GET /api/progress/user/:userId` - Get all user progress
- `GET /api/progress/user/:userId/level/:levelId` - Get level progress
- `PUT /api/progress/user/:userId/level/:levelId` - Update progress
- `GET /api/progress/user/:userId/total-score` - Get total score

### Results
- `POST /api/results/submit` - Submit exercise result
- `GET /api/results/user/:userId` - Get user results
- `POST /api/results/diagnosis/submit` - Submit diagnosis result

## 🎓 Usage Examples

### Student Flow
1. Visit home page → Select "I'm a student"
2. Take diagnostic test (optional)
3. Choose level to practice
4. Solve exercises and get instant feedback
5. Track progress in dashboard

### Teacher Flow
1. Visit home page → Select "I'm a teacher"
2. Create/edit exercises through dashboard
3. View student results and statistics
4. Export data for analysis

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Set up database
npm run setup

# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Reset database (careful!)
npm run reset
```

## 🐛 Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running
- Check credentials in `.env` file
- Verify database exists: `createdb flas_learning`

### "Port 3000 already in use"
- Change PORT in `.env`
- Or kill process: `npx kill-port 3000`

### "Module not found" errors
- Delete `node_modules` folder
- Run `npm install` again

### Database table issues
- Run reset: `npm run reset`
- Then setup: `npm run setup`

## 📊 Database Schema

### Users
- Stores student, teacher, and guest accounts
- Password hashing with bcrypt
- JWT token authentication

### Exercises
- Exercise content and metadata
- JSON support for complex data
- Level-based organization

### Progress & Results
- Real-time tracking of student achievements
- Attempt logging and scoring
- Diagnosis result storage

## 🔒 Security

- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Input validation on all endpoints
- CORS protection
- SQL injection prevention with parameterized queries

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🌍 Language

- Arabic (العربية) - Primary language
- RTL (Right-to-Left) layout
- UTF-8 encoding

## 📄 License

This project is created for educational purposes.

## 👥 Credits

**Development**: Backend API system with database integration
**Original Design**: Interactive learning platform interface

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📧 Support

For issues or questions:
1. Check `SETUP_GUIDE.md` for detailed instructions
2. Review troubleshooting section above
3. Check error messages in browser console and server logs

## 🎉 Getting Started

The fastest way to get started:

```bash
# Windows
double-click quick-start.bat

# Mac/Linux
bash quick-start.sh

# Manual
npm install && npm run setup && npm run dev
```

Then visit **http://localhost:3000**

---

**Happy Learning!** 🚀
