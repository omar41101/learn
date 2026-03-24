import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

// 
// DIAGNOSIS EXERCISES  (is_diagnosis = 1)
// 
const diagnosisExercises = [
  {
    level_id: 1,
    title: 'س1: اربط الأشكال الهندسية',
    type: 'matching',
    question: 'اربط الأشكال الهندسية التالية (مربع، مثلث، مستطيل)',
    hint: 'فكر في عدد الأضلاع والزوايا',
    data: {
      pairs: [
        { animal: 'مربع',    movement: 'مربع'    },
        { animal: 'مثلث',    movement: 'مثلث'    },
        { animal: 'مستطيل', movement: 'مستطيل' }
      ],
      movementsAsShapes: true,
      movements: [
        { movement: 'مربع',    shape: 'square'    },
        { movement: 'مثلث',    shape: 'triangle'  },
        { movement: 'مستطيل', shape: 'rectangle' }
      ]
    }
  },
  {
    level_id: 1,
    title: 'س2: لون العصفور',
    type: 'coloring',
    question: 'لون الشكل التالي (صورة عصفور)',
    hint: 'اختر اللون ثم انقر على العصفور لتلوينه',
    data: {
      palette: ['#e74c3c', '#000000', '#2ecc71', '#f1c40f'],
      correctAnswer: 0,
      image_url: 'bird_outline.png' // Placeholder for user
    }
  },
  {
    level_id: 1,
    title: 'س3: ضع الاسم المناسب تحت كل صورة',
    type: 'selection',
    question: 'ضع الاسم المناسب تحت كل صورة (تفاحة، كلب، سيارة، طاولة)',
    hint: 'اقرأ الاسم وضعه تحت الصورة المطابقة',
    data: {
      images:        ['تفاحة', 'كلب', 'سيارة', 'طاولة'],
      senses:        ['تفاحة', 'كلب', 'سيارة', 'طاولة'],
      correctMatches: [0, 1, 2, 3],
      image_urls: ['apple.png', 'dog.avif', 'car.avif', 'table.avif']
    }
  },
  {
    level_id: 1,
    title: 'س4: لون الكائنات الحية والغير حية',
    type: 'drag-drop',
    question: 'لون الكائنات الحية بالأحمر والكائنات الغير حية بالأخضر (شجرة، طفل، كتاب، كرسي)',
    hint: 'هل تتنفس هل تكبر',
    data: {
      categories: ['حية', 'غير حية'],
      items: [
        { name: 'شجرة', correctCategory: 'حية'      },
        { name: 'طفل',  correctCategory: 'حية'      },
        { name: 'كتاب', correctCategory: 'غير حية' },
        { name: 'كرسي', correctCategory: 'غير حية' }
      ]
    }
  },
  {
    level_id: 1,
    title: 'س5: رتب مراحل نمو النبات',
    type: 'drag-drop',
    question: 'رتب الصور التالية (صور مراحل نمو النبات)',
    hint: 'ابدأ بالبذرة ثم تابع النمو',
    data: {
      categories: ['مرحلة 1', 'مرحلة 2', 'مرحلة 3', 'مرحلة 4'],
      items: [
        { name: 'بذرة',  correctCategory: 'مرحلة 1', image: 'seed.jpg' },
        { name: 'إنبات', correctCategory: 'مرحلة 2', image: 'seedling.jpg' },
        { name: 'نبتة',  correctCategory: 'مرحلة 3', image: 'plant.jpg' },
        { name: 'زهرة',  correctCategory: 'مرحلة 4', image: 'flower.jpg' }
      ]
    }
  },
  {
    level_id: 1,
    title: 'س6: المجموعات البيئية',
    type: 'drag-drop',
    question: 'ضع كل صورة في المجموعة المناسبة لها (مجموعة التنقل في البر فقط، في الماء فقط، في البر والماء)',
    hint: 'فكر أين يعيش كل حيوان',
    data: {
      categories: ['بر فقط', 'ماء فقط', 'بر وماء'],
      items: [
        { name: 'ضفدع',  correctCategory: 'بر وماء',  image: 'gromp.jpg'    },
        { name: 'دجاجة', correctCategory: 'بر فقط',  image: 'cock.jpg' },
        { name: 'سمكة',  correctCategory: 'ماء فقط', image: 'fish.jpg'    },
        { name: 'دلفين', correctCategory: 'ماء فقط', image: 'dolphin.jpg' },
        { name: 'بقرة',  correctCategory: 'بر فقط',  image: 'cow.jpg'     },
        { name: 'أفعى',  correctCategory: 'بر فقط',  image: 'snake.jpg'   }
      ]
    }
  },
  {
    level_id: 1,
    title: 'س7: المواد السائلة والصلبة',
    type: 'drag-drop',
    question: 'ضع المواد السائلة في دائرة والمواد الصلبة في إطار (ماء، صخرة، حليب، طباشير، مقص، زيت)',
    hint: 'هل يتدفق أم يحتفظ بشكله',
    data: {
      categories: ['سائل', 'صلب'],
      items: [
        { name: 'ماء',    correctCategory: 'سائل', image: 'water.jpg' },
        { name: 'صخرة',   correctCategory: 'صلب',  image: 'stone.jpg'  },
        { name: 'حليب',   correctCategory: 'سائل', image: 'milk.jpg'  },
        { name: 'طباشير', correctCategory: 'صلب',  image: 'chalk.jpg' },
        { name: 'مقص',    correctCategory: 'صلب',  image: 'cissors.jpg' },
        { name: 'زيت',    correctCategory: 'سائل', image: 'oil.jpg'   }
      ]
    }
  },
  {
    level_id: 1,
    title: 'س9: الزكام والفيروسات',
    type: 'multiple_choice',
    question: 'أكمل الجمل بالكلمات التالية (العطس، الأنف، غسل اليدين)',
    hint: '',
    data: {
      questions: [
        { q: 'عند الزكام يحدث....', options: ['العطس', 'السعال', 'الحمى'], correctAnswer: 0 },
        { q: 'يدخل الفيروس إلى الجسم عبر .....', options: ['العطس', 'الأنف', 'الفم'], correctAnswer: 1 },
        { q: 'نحمي انفسنا من الزكام ب….. بانتظام', options: ['العطس', 'الأنف', 'غسل اليدين'], correctAnswer: 2 }
      ]
    }
  },
  {
    level_id: 1,
    title: 'س10: تغذية الحيوانات',
    type: 'multiple_choice',
    question: 'ضع علامة امام الاجابة الصحيحة',
    hint: '',
    data: {
      questions: [
        { q: 'تتغذى البقرة على:', options: ['عشب', 'لحم'], correctAnswer: 0 },
        { q: 'يتغذى الاسد على:', options: ['عشب', 'لحم'], correctAnswer: 1 }
      ]
    }
  }
];

// 
// LEVEL EXERCISES  (is_diagnosis = 0)
// 
const levelExercises = [
  //  Level 1 
  {
    level_id: 1,
    title: 'م1: اختيار الإجابة الصحيحة',
    type: 'multiple_choice',
    question: 'ضع علامة أمام طريقة تنقل الحيوان حسب الفيديو',
    hint: 'شاهد الفيديو جيدا ولاحظ حركة الأرجل',
    data: { options: ['عدو', 'قفز', 'زحف'], correctAnswer: 0, video_url: 'hr.mp4' }
  },
  {
    level_id: 1,
    title: 'م2: تصنيف الحيوانات',
    type: 'drag-drop',
    question: 'ضع الاجابة الصحيحة في اطار حسب ما تشاهده في الفيديو هذا الحيوان(لاحمعاشبكالش)',
    hint: 'تذكر: اللاحم يأكل اللحم العاشب يأكل النبات',
    data: {
      image_url: 'vector-illustration-showing-cow-eating-grass_642458-405.avif',
      categories: ['لاحم', 'عاشب', 'كالش'],
      items: [{ name: 'بقرة', correctCategory: 'عاشب' }]
    }
  },
  //  Level 2 
  {
    level_id: 2,
    title: 'م1: مطابقة الحيوانات',
    type: 'matching',
    question: 'صل صورة الحيوان بنمط تنقله',
    hint: 'فكر في طريقة حركة كل حيوان',
    data: {
      pairs: [
        { animal: 'كلب',    movement: 'عدو'   },
        { animal: 'أفعى',   movement: 'زحف'   },
        { animal: 'عصفور', movement: 'طيران' }
      ],
      movementsOrder: ['زحف', 'طيران', 'عدو']
    }
  },
  {
    level_id: 2,
    title: 'م2: الحواس',
    type: 'selection',
    question: 'ضع تحت كل صورة الحاسة المستعملة',
    hint: 'ماذا نستخدم لنرى نسمع نحس',
    data: {
      images:        ['عين', 'أذن', 'يد'],
      senses:        ['بصر', 'سمع', 'لمس'],
      correctMatches: [0, 1, 2]
    }
  },
  //  Level 3 
  {
    level_id: 3,
    title: 'م1: تقليد طريقة التنقل',
    type: 'multiple_choice',
    question: 'تقليد طريقة تنقل الحيوان في الفيديو',
    hint: 'شاهد الفيديو جيدا وقلد الحركة الصحيحة',
    data: { options: ['عدو', 'قفز', 'زحف'], correctAnswer: 0 }
  },
  {
    level_id: 3,
    title: 'م2: الحواس',
    type: 'selection',
    question: 'استخرج الحاسة المناسبة لكل صورة',
    hint: 'فكر في الحاسة المناسبة لكل صورة',
    data: {
      images:        ['عين', 'أذن', 'يد'],
      senses:        ['بصر', 'سمع', 'لمس'],
      correctMatches: [0, 1, 2]
    }
  },
  //  Level 4 
  {
    level_id: 4,
    title: 'م1: دورة الماء في الطبيعة (رتبها)',
    type: 'drag-drop',
    question: 'رتب مراحل دورة الماء الصحيحة حسب الطبيعة',
    hint: 'ابدأ من مصدر الماء (البحر) ثم اتبع المراحل: تبخر  تكثف  هطول',
    data: {
      categories: ['الخطوة 1', 'الخطوة 2', 'الخطوة 3', 'الخطوة 4'],
      items: [
        { name: 'تبخر',         correctCategory: 'الخطوة 2' },
        { name: 'بحر',          correctCategory: 'الخطوة 1' },
        { name: 'نزول الامطار', correctCategory: 'الخطوة 4' },
        { name: 'تكثف السحب',   correctCategory: 'الخطوة 3' }
      ]
    }
  },
  {
    level_id: 4,
    title: 'م2: اختر المصطلح الصحيح',
    type: 'multiple_choice',
    question: 'يتحول الماء الى بخار تحت تأثير الشمس تسمى هذه الظاهرة ب:',
    hint: 'التجمد يعني تحول الماء إلى ثلج أما التحول إلى بخار فهو...',
    data: { options: ['تجمد', 'تبخر'], correctAnswer: 1 }
  },
  {
    level_id: 4,
    title: 'م3: رتب السلسلة الغذائية',
    type: 'drag-drop',
    question: 'رتب السلسلة الغذائية التالية من المنتج إلى المفترس الأعلى',
    hint: 'ابحث عن المنتج أولا ثم اتبع من يتغذى على من حتى تصل إلى المفترس الأعلى',
    data: {
      categories: ['الترتيب 1', 'الترتيب 2', 'الترتيب 3', 'الترتيب 4', 'الترتيب 5'],
      items: [
        { name: 'ضفدع',  correctCategory: 'الترتيب 3' },
        { name: 'عشب',   correctCategory: 'الترتيب 1' },
        { name: 'صقر',   correctCategory: 'الترتيب 5' },
        { name: 'ثعبان', correctCategory: 'الترتيب 4' },
        { name: 'جرادة', correctCategory: 'الترتيب 2' }
      ]
    }
  }
];

// 
async function seedExercises() {
  try {
    console.log(' Starting exercise seed...\n');

    // 1  Ensure the is_diagnosis column exists (idempotent migration)
    try {
      await pool.execute(
        'ALTER TABLE exercises ADD COLUMN is_diagnosis TINYINT(1) NOT NULL DEFAULT 0'
      );
      console.log(' Added is_diagnosis column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ  is_diagnosis column already exists  skipping ALTER TABLE');
      } else {
        throw e;
      }
    }

    // 2  Clear all existing exercises
    await pool.execute('DELETE FROM exercises');
    console.log('  Cleared all existing exercises\n');

    // 3  Insert diagnosis exercises
    console.log(' Seeding Diagnosis Exercises...');
    for (const ex of diagnosisExercises) {
      await pool.execute(
        `INSERT INTO exercises (level_id, exercise_type, title, question_text, hint, data, is_diagnosis)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [ex.level_id, ex.type, ex.title, ex.question, ex.hint || '', JSON.stringify(ex.data)]
      );
      console.log(`   ${ex.title}`);
    }

    // 4  Insert level exercises
    console.log('\n Seeding Level Exercises...');
    for (const ex of levelExercises) {
      await pool.execute(
        `INSERT INTO exercises (level_id, exercise_type, title, question_text, hint, data, is_diagnosis)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [ex.level_id, ex.type, ex.title, ex.question, ex.hint || '', JSON.stringify(ex.data)]
      );
      console.log(`   [Level ${ex.level_id}] ${ex.title}`);
    }

    // 5  Summary
    console.log('\n All exercises seeded successfully!');
    const [summary] = await pool.execute(
      'SELECT level_id, is_diagnosis, COUNT(*) as cnt FROM exercises GROUP BY level_id, is_diagnosis ORDER BY level_id, is_diagnosis'
    );
    console.log('\n Summary:');
    summary.forEach(r =>
      console.log(`  Level ${r.level_id} | ${r.is_diagnosis ? 'diagnosis' : 'regular '} | ${r.cnt} exercises`)
    );

    process.exit(0);
  } catch (err) {
    console.error(' Error seeding exercises:', err);
    process.exit(1);
  }
}

seedExercises();
