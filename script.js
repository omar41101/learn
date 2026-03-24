/*****************************************************************
 * ملف JavaScript الرئيسي
 * يحتوي على وظائف مشتركة بين جميع الصفحات
 *****************************************************************/

/*****************************************************************
 * ⚠️ TODO: منطقة زميلك الرئيسية
 * هذا الملف فارغ تقريباً - زميلك سيضيف نظام التخزين هنا
 *****************************************************************/

/*****************************************************************
 * وظائف عامة
 *****************************************************************/

// تحميل البيانات (مؤقتة - TODO: زميلك يعدلها)
function loadData(key) {
    console.log(`TODO: تحميل ${key} من localStorage`);
    return null;
}

// حفظ البيانات (مؤقتة - TODO: زميلك يعدلها)
function saveData(key, data) {
    console.log(`TODO: حفظ ${key} في localStorage:`, data);
    return false;
}

// حذف البيانات (مؤقتة - TODO: زميلك يعدلها)
function deleteData(key) {
    console.log(`TODO: حذف ${key} من localStorage`);
    return false;
}

/*****************************************************************
 * وظائف المستخدمين
 *****************************************************************/

// تسجيل دخول المستخدم (مؤقتة)
function loginUser(userType, username = '') {
    console.log(`TODO: تسجيل دخول ${userType} باسم ${username}`);
    // سيضيف زميلك: حفظ في localStorage
    return true;
}

// تسجيل الخروج (مؤقتة)
function logoutUser() {
    console.log('TODO: تسجيل الخروج وحذف بيانات الجلسة');
    // سيضيف زميلك: حذف من localStorage
    return true;
}

// الحصول على المستخدم الحالي (مؤقتة)
function getCurrentUser() {
    console.log('TODO: جلب بيانات المستخدم الحالي من localStorage');
    return null;
}

/*****************************************************************
 * وظائف التمارين
 *****************************************************************/

// حفظ نتيجة التمرين (مؤقتة)
function saveExerciseResult(level, exerciseId, score) {
    console.log(`TODO: حفظ نتيجة المستوى ${level}, التمرين ${exerciseId}: ${score} نقطة`);
    // سيضيف زميلك: حفظ في localStorage
    return true;
}

// جلب نتائج المستوى (مؤقتة)
function getLevelResults(level) {
    console.log(`TODO: جلب نتائج المستوى ${level} من localStorage`);
    return {};
}

// تحديث تقدم المستخدم (مؤقتة)
function updateUserProgress(level, score) {
    console.log(`TODO: تحديث تقدم المستخدم للمستوى ${level} بـ ${score} نقطة`);
    // سيضيف زميلك: تحديث في localStorage
    return true;
}

/*****************************************************************
 * وظائف المعلم
 *****************************************************************/

// حفظ تمرين جديد (مؤقتة)
function saveNewExercise(level, exerciseData) {
    console.log(`TODO: حفظ تمرين جديد للمستوى ${level}:`, exerciseData);
    // سيضيف زميلك: حفظ في localStorage
    return true;
}

// جلب جميع التمارين (مؤقتة)
function getAllExercises() {
    console.log('TODO: جلب جميع التمارين من localStorage');
    return [];
}

// جلب نتائج جميع الطلاب (مؤقتة)
function getAllStudentResults() {
    console.log('TODO: جلب نتائج جميع الطلاب من localStorage');
    return [];
}

// تصدير البيانات (مؤقتة)
function exportData(format = 'json') {
    console.log(`TODO: تصدير البيانات بصيغة ${format}`);
    // سيضيف زميلك: إنشاء ملف وتنزيله
    return false;
}

/*****************************************************************
 * وظائف مساعدة
 *****************************************************************/

// إظهار رسالة
function showMessage(message, type = 'info', duration = 3000) {
    // إنشاء عنصر الرسالة إذا لم يكن موجوداً
    let messageBox = document.getElementById('messageBox');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'messageBox';
        messageBox.className = 'message-box';
        document.body.appendChild(messageBox);
    }
    
    // تحديد الأيقونة بناءً على النوع
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'times-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    messageBox.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
    
    // إخفاء الرسالة بعد المدة المحددة
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, duration);
}

// التحقق من اتصال الإنترنت
function checkInternetConnection() {
    return navigator.onLine;
}

// تنسيق التاريخ
function formatDate(date = new Date()) {
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// إنشاء معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/*****************************************************************
 * تهيئة الموقع
 *****************************************************************/
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من اتصال الإنترنت
    if (!checkInternetConnection()) {
        showMessage('⚠️ أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل.', 'warning', 5000);
    }
    
    // إضافة مستمعي الأحداث
    setupEventListeners();
});

function setupEventListeners() {
    // إعادة تحميل الصفحة عند استعادة الاتصال
    window.addEventListener('online', function() {
        showMessage('✅ تم استعادة الاتصال بالإنترنت', 'success');
    });
    
    window.addEventListener('offline', function() {
        showMessage('⚠️ فقدت الاتصال بالإنترنت', 'warning');
    });
}

/*****************************************************************
 * التصدير والاستيراد (TODO: زميلك يطورها)
 *****************************************************************/
function exportToJSON() {
    console.log('TODO: تصدير جميع البيانات كملف JSON');
    // سيضيف زميلك: جمع البيانات من localStorage وإنشاء ملف
}

function importFromJSON(file) {
    console.log('TODO: استيراد البيانات من ملف JSON:', file);
    // سيضيف زميلك: قراءة الملف وتحديث localStorage
}

/*****************************************************************
 * النسخ الاحتياطي (TODO: زميلك يطورها)
 *****************************************************************/
function createBackup() {
    console.log('TODO: إنشاء نسخة احتياطية');
    // سيضيف زميلك: حفظ نسخة من localStorage
}

function restoreBackup(backupData) {
    console.log('TODO: استعادة النسخة الاحتياطية:', backupData);
    // سيضيف زميلك: استبدال localStorage بالبيانات المستعادة
}

/*****************************************************************
 * الإحصائيات (TODO: زميلك يطورها)
 *****************************************************************/
function calculateStatistics() {
    console.log('TODO: حساب الإحصائيات');
    // سيضيف زميلك: تحليل البيانات من localStorage
    return {
        totalStudents: 0,
        totalExercises: 0,
        averageScore: 0,
        completionRate: 0
    };
}