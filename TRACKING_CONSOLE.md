# 📚 نظام التمارين والتتبع - دليل المستخدم

## ما الجديد؟ ✨

تم دمج نظام متكامل لإدارة التمارين وتتبع النتائج مع قاعدة البيانات:
- ✅ جميع التمارين محفوظة في قاعدة البيانات
- ✅ تتبع تلقائي لمحاولات الطالب
- ✅ حفظ النقاط والتقدم
- ✅ تقارير مفصلة للمعلمين
- ✅ واجهة سهلة الاستخدام

---

## خطوات التشغيل

### 1️⃣ تثبيت المتطلبات

```bash
cd server
npm install
```

### 2️⃣ إعداد قاعدة البيانات

```bash
npm run setup-db
```

هذا سيقوم:
- إنشاء قاعدة البيانات
- إنشاء جميع الجداول
- إدراج المستويات الافتراضية

### 3️⃣ إضافة التمارين إلى قاعدة البيانات (IMPORTANT!)

```bash
npm run seed-exercises
```

هذا سيقوم:
- إضافة جميع تمارين التشخيص (12 تمرين)
- إضافة تمارين المستويات 1-4 (8 تمارين)
- إدراجها في الجداول المناسبة

### 4️⃣ تشغيل الخادم

```bash
npm start
# أو للتطوير مع التحديث التلقائي:
npm run dev
```

الخادم يعمل على: `http://localhost:3000`

---

## كيفية عمل النظام

### 📡 تدفق البيانات:

```
exercise.html
    ↓
    ├─→ تحديث المستخدم الحالي (localStorage)
    ├─→ جلب التمارين من API
    │   └─→ GET /api/exercises/level/1
    │       └─→ قاعدة البيانات
    ├─→ تحميل التمرين
    ├─→ المستخدم يجيب
    ├─→ التحقق من الإجابة
    ├─→ حفظ النتيجة في قاعدة البيانات
    │   └─→ POST /api/results/submit
    │       └─→ جدول exercise_results
    ├─→ تحديث النقاط المحلية
    ├─→ تحديث التقدم في قاعدة البيانات
    │   └─→ POST /api/progress
    │       └─→ جدول user_progress
    └─→ عرض رسالة النتيجة
```

### 🎯 جداول قاعدة البيانات:

**exercises** - التمارين
- `id` - معرف التمرين
- `level_id` - المستوى
- `exercise_type` - نوع التمرين (multiple_choice, drag_drop, etc.)
- `title` - عنوان التمرين
- `question_text` - نص السؤال
- `hint` - التلميح
- `data` - بيانات التمرين (JSON)

**exercise_results** - نتائج التمارين
- `id` - معرف النتيجة
- `user_id` - معرف الطالب
- `exercise_id` - معرف التمرين
- `level_id` - المستوى
- `score` - النقاط المحصولة
- `attempts` - رقم المحاولة
- `is_correct` - هل الإجابة صحيحة
- `user_answer` - الإجابة (JSON)
- `completed_at` - تاريخ الإتمام

**user_progress** - التقدم الكلي
- `user_id` - معرف الطالب
- `level_id` - المستوى
- `score` - النقاط الكلية
- `completed` - هل اكتمل المستوى
- `completed_at` - تاريخ الإتمام

---

## API Endpoints

### الحصول على التمارين
```
GET /api/exercises/level/:levelId
```

**الرد:**
```json
[
  {
    "id": 1,
    "level_id": 1,
    "exercise_type": "multiple_choice",
    "title": "تمرين 1",
    "question_text": "السؤال؟",
    "hint": "تلميح",
    "data": { "options": [...], "correctAnswer": 0 }
  }
]
```

### حفظ نتيجة التمرين
```
POST /api/results/submit
```

**البيانات المطلوبة:**
```json
{
  "user_id": "123",
  "exercise_id": 1,
  "level_id": 1,
  "score": 10,
  "is_correct": true,
  "user_answer": { ... }
}
```

### تحديث التقدم
```
POST /api/progress
```

**البيانات المطلوبة:**
```json
{
  "user_id": "123",
  "level_id": 1,
  "score": 50,
  "completed": false
}
```

### الحصول على نتائج الطالب
```
GET /api/results/user/:userId
GET /api/results/user/:userId/level/:levelId
```

---

## معرف المستخدم (User ID)

### للمستخدمين المسجلين:
```javascript
localStorage.setItem('userId', '123');
```

### للضيوف:
تلقائياً يتم إنشاء معرف ضيف: `guest_1708873600000`

### التحقق من معرفك الحالي:
```javascript
console.log(localStorage.getItem('userId') || localStorage.getItem('guestUserId'));
```

---

## اختبار النظام

### 1️⃣ اختبر تحميل التمارين:
افتح console في المتصفح (F12):
```javascript
fetch('http://localhost:3000/api/exercises/level/1')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 2️⃣ اختبر حفظ النتيجة:
```javascript
fetch('http://localhost:3000/api/results/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: '123',
    exercise_id: 1,
    level_id: 1,
    score: 10,
    is_correct: true,
    user_answer: { option: 0 }
  })
}).then(r => r.json()).then(d => console.log(d))
```

### 3️⃣ تحقق من النتائج:
```javascript
fetch('http://localhost:3000/api/results/user/123')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## معلومات المتقدمين

### إضافة تمارين جديدة يدويًا:

```bash
# 1. استخدم السيد الملتف (Curl):
curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "level_id": 1,
    "exercise_type": "multiple_choice",
    "title": "تمرين جديد",
    "question_text": "ما هو ...؟",
    "hint": "فكر...",
    "data": {
      "options": ["أ", "ب", "ج"],
      "correctAnswer": 0
    }
  }'
```

### تخصيص بيانات التمرين:

التمارين يمكنها أن تحتوي على `data` JSON مخصص حسب نوعها:

**Multiple Choice:**
```json
{"options": ["أ", "ب", "ج"], "correctAnswer": 0}
```

**Drag Drop:**
```json
{
  "categories": ["فئة 1", "فئة 2"],
  "items": [{"name": "عنصر", "correctCategory": "فئة 1"}]
}
```

**Matching:**
```json
{
  "pairs": [{"animal": "أسد", "movement": "عدو"}],
  "movementsOrder": ["عدو", "زحف"]
}
```

**Selection:**
```json
{
  "images": ["عين", "أذن"],
  "senses": ["بصر", "سمع"],
  "correctMatches": [0, 1]
}
```

**Coloring:**
```json
{
  "palette": ["#e74c3c", "#000000", "#2ecc71"],
  "correctAnswer": {"body": 0, "head": 1, "wing": 2}
}
```

---

## استكشاف الأخطاء

### ❌ "فشل تحميل التمارين"
- تأكد من تشغيل الخادم: `npm start`
- تحقق من الـ URL في console
- تأكد من تشغيل `npm run seed-exercises`

### ❌ "قاعدة البيانات غير موجودة"
- شغل: `npm run setup-db`
- ثم: `npm run seed-exercises`

### ❌ "لا توجد تمارين"
```bash
npm run seed-exercises
```

### ✅ التحقق من أن كل شيء يعمل:
```bash
npm start
# افتح http://localhost:3000/exercise.html?level=1
# افتح console (F12) وتحقق من الرسائل
```

---

## الملخص

| الخطوة | الأمر | ملاحظة |
|-------|-------|--------|
| 1 | `npm install` | تثبيت المتطلبات |
| 2 | `npm run setup-db` | إنشاء قاعدة البيانات |
| 3 | `npm run seed-exercises` | ⭐ لا تنسى هذا! |
| 4 | `npm start` | بدء الخادم |

---

## 🎉 نجحت!

الآن يمكنك:
- 📖 تحميل التمارين من قاعدة البيانات تلقائياً
- 📊 تتبع نتائج جميع الطلاب  
- 💾 حفظ جميع البيانات آمنة
- 📈 عرض التقارير والإحصائيات

استمتع! 🚀
