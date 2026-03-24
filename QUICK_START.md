# 🚀 FLAS Learning Platform - Quick Setup Guide

## Prerequisites
- **Node.js** installed
- **MySQL** running locally (or remote)
- Internet connection (first run to download packages)

## ⚡ Quick Start (5 minutes)

### Step 1: Configure Database
Open `.env` file and fill in your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=flas_learning
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secret_key
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Server
```bash
npm start
```

**✅ Done!** The server will:
- Connect to MySQL
- Automatically create all tables
- Insert default levels (1-4)

Access the app at: **http://localhost:3000**

---

## 📋 What Gets Created

| Table | Purpose |
|-------|---------|
| `users` | Student/Teacher accounts |
| `levels` | 4 learning levels |
| `exercises` | Questions/tasks for students |
| `exercise_results` | Student answers and scores |
| `user_progress` | Progress tracking per level |
| `diagnosis_results` | Diagnostic test results |

---

## 🔧 Manual Database Setup

If auto-initialization fails:

```bash
npm run setup-db
```

This manually runs all SQL commands to create tables and insert levels.

---

## ❌ Troubleshooting

### "Cannot add or update a child row: foreign key constraint"
→ **Fix:** Levels table is empty. Server will auto-fix on restart. If not:
```bash
npm run setup-db
```

### "connect ECONNREFUSED 127.0.0.1:3306"
→ **Fix:** MySQL not running
```bash
# macOS
brew services start mysql

# Windows - use MySQL Command Line or MySQL Workbench to start service

# Linux
sudo systemctl start mysql
```

### "Access denied for user 'root'"
→ **Fix:** Check `.env` file - password must match your MySQL password

### "Unknown database 'flas_learning'"
→ **Fix:** Run setup:
```bash
npm run setup-db
```

---

## 👨‍🎓 Using the Platform

1. **Register** - Create student or teacher account
2. **Login** - Choose your role (student/teacher)
3. **Teachers** - Manage students, create exercises
4. **Students** - Complete exercises, track progress

---

## 📚 Default Levels

1. **المستوى الأول** - Basic questions for level assessment
2. **المستوى الثاني** - Intermediate level
3. **المستوى الثالث** - Advanced level  
4. **المستوى الرابع** - Hard level

---

## 🛑 Stopping the Server

Press `Ctrl + C` in the terminal

---

## 🆘 Need Help?

Check the server console output for error messages:
- 🟢 Green messages = Working fine
- 🔴 Red messages = Errors (read carefully!)
- 🟡 Yellow messages = Warnings (usually safe)

