# 🚀 QUICK REFERENCE CARD

## The 4 Commands You Need

```powershell
# 1. Setup database
npm run setup-db

# 2. Add exercises (DO THIS FIRST TIME!)
npm run seed-exercises

# 3. Start server
npm start

# 4. Open in browser
http://localhost:3000/exercise.html?level=1
```

---

## Useful Commands

```bash
# Development with auto-reload
npm run dev

# Reset everything and start fresh
npm run reset
npm run setup-db
npm run seed-exercises

# Check database content
# (Connect to MySQL)
USE flas_learning;
SELECT COUNT(*) FROM exercises;
SELECT * FROM exercise_results LIMIT 5;
SELECT * FROM user_progress;
```

---

## Browser Console Tests (F12)

```javascript
// Load exercises
fetch('http://localhost:3000/api/exercises/level/1')
  .then(r => r.json()).then(d => console.log(d))

// Set user ID
localStorage.setItem('userId', 'test123')

// Save a result manually
fetch('http://localhost:3000/api/results/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'test123',
    exercise_id: 1,
    level_id: 1,
    score: 10,
    is_correct: true,
    user_answer: {answer: 'A'}
  })
}).then(r => r.json()).then(d => console.log(d))

// Get all results for a user
fetch('http://localhost:3000/api/results/user/test123')
  .then(r => r.json()).then(d => console.log(d))
```

---

## Status Indicators (in Console)

- ✅ Green = Success
- ❌ Red = Error  
- ⚠️ Yellow = Warning
- 📡 Blue = Info

Look for messages like:
- `✅ تم تحميل التمارين` = Exercises loaded
- `✅ تم حفظ النتيجة` = Result saved
- `⚠️ النتائج غير محفوظة للضيوف` = Guest mode (no save)

---

## Troubleshooting Checklist

- ✅ MySQL running? (start service)
- ✅ `.env` file exists with password?
- ✅ Ran `npm install`? 
- ✅ Ran `npm run setup-db`?
- ✅ Ran `npm run seed-exercises`? (⭐ IMPORTANT)
- ✅ Server running with `npm start`?
- ✅ Port 3000 available?
- ✅ Browser not cached? (Ctrl+F5)

If stuck: Run `npm run reset` then all setup steps again

---

## File Changes Summary

### New Files Created:
- seed-exercises.js (410 lines of exercise data)
- TRACKING_CONSOLE.md (complete docs)
- SETUP_GUIDE.md (detailed steps)
- INTEGRATION_SUMMARY.txt (this helpful file)
- quick-start.sh (automated setup)

### Modified Files:
- package.json (added seed-exercises script)
- exercise.html (added API integration)

---

## What Gets Saved?

Every answer submission saves:
- exercise_id
- user_id  
- level_id
- is_correct (true/false)
- user_answer (their response)
- score (points earned)
- attempts (try number)
- timestamp

Total exercises: 16
- Level 1: 2
- Level 2: 2
- Level 3: 2
- Level 4: 3
- Diagnosis: 12

---

## Next Features to Add

```javascript
// Teacher dashboard
GET /api/results/user/:userId/statistics

// Leaderboard
GET /api/progress/leaderboard

// Export results
GET /api/results/export?format=csv&level=1

// Analytics
GET /api/analytics/level/:levelId
```

---

## Default Levels

After setup, database has:
- Level 1: 2 exercises
- Level 2: 2 exercises
- Level 3: 2 exercises  
- Level 4: 3 exercises
- Diagnosis: 12 exercises

Add more with:
```javascript
POST /api/exercises
{
  "level_id": 1,
  "exercise_type": "multiple_choice",
  "title": "My Exercise",
  "question_text": "What is...?",
  "hint": "Think about...",
  "data": {
    "options": ["A", "B", "C"],
    "correctAnswer": 0
  }
}
```

---

Made with ❤️ for learning!
Questions? Check SETUP_GUIDE.md for full docs
