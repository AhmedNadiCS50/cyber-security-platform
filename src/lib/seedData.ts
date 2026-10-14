/**
 * seedData.ts
 *
 * Starter content for the cyber-security platform.
 * ⚠️ This is intentionally SMALL starter content so the platform works
 * end-to-end. Real lessons / quizzes / challenges are published from the Admin
 * panel (content is managed there).
 */

export type QuestionType = "mcq" | "terminal" | "flag" | "code";

export interface Question {
  id: string;
  type: QuestionType;
  questionAr: string;
  questionEn: string;

  // ── mcq ─────────────────────────────────────────────
  options?: { ar: string; en: string }[];
  correctIndex?: number;

  // ── terminal ────────────────────────────────────────
  /** The task shown above the terminal, e.g. "اكتب الأمر لطباعة الملفات" */
  terminalPromptAr?: string;
  terminalPromptEn?: string;
  /** Accepted (normalized) commands. Comparison ignores case & extra spaces. */
  acceptedAnswers?: string[];

  // ── flag ────────────────────────────────────────────
  expectedFlag?: string;

  // ── code ────────────────────────────────────────────
  language?: string;
  starterCode?: string;
  solutionCode?: string;
  /** Optional regex (as string) the submitted code must match. */
  expectedPattern?: string;

  // ── shared ──────────────────────────────────────────
  explanationAr: string;
  explanationEn: string;
}

export interface Lesson {
  id: string;
  levelId: string;
  order: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  /** Optional YouTube video ID (e.g. "dQw4w9WgXcQ"). */
  youtubeId?: string;
  /** Optional text/markdown body when there is a written lesson. */
  contentAr?: string;
  contentEn?: string;
  /** Optional resources/references for the lesson (array of title+url). */
  resources?: { title: string; url: string }[];
  xp: number;
  passScore: number;
  published: boolean;
  quiz: Question[];
}

export interface Level {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  published: boolean;
  lessons: Lesson[];
}

export interface Challenge {
  id: string;
  titleAr: string;
  titleEn: string;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  hintAr: string;
  hintEn: string;
  published: boolean;
  publishDate?: string;
  /** The actual challenge itself. */
  question: Question;
}

/** Returns true when every lesson of the stage is present in `completedLessonIds`. */
export function isLevelComplete(level: Level, completedLessonIds: string[]): boolean {
  return level.lessons.length > 0 && level.lessons.every((l) => completedLessonIds.includes(l.id));
}

export const SEED_LEVELS: Level[] = [
  {
    id: "level-1",
    order: 1,
    titleAr: "المرحلة 1: أساسيات الأمن السيبراني",
    titleEn: "Stage 1: Cyber Security Fundamentals",
    descriptionAr: "ما هو الأمن السيبراني؟ مثلث CIA، الفرق بين المخترق الأخلاقي والمجرم، وأنواع الهجمات الشائعة.",
    descriptionEn: "What is cyber security? The CIA triad, hackers vs. criminals, and common attack types.",
    published: true,
    lessons: [
      {
        id: "lesson-1-1",
        levelId: "level-1",
        order: 1,
        titleAr: "ما هو الأمن السيبراني؟",
        titleEn: "What is Cyber Security?",
        descriptionAr: "تعريف الأمن السيبراني وأهميته في حماية الأنظمة والبيانات والشبكات.",
        descriptionEn: "Define cyber security and why it matters for systems, data and networks.",
        contentAr:
          "الأمن السيبراني هو ممارسة حماية الأنظمة والشبكات والبرامج والبيانات من الهجمات الرقمية. يقسمه الخبراء إلى ثلاثة أهداف أساسية تعرف بـ **مثلث CIA**: السرية (Confidentiality)، السلامة (Integrity)، والتوافر (Availability).",
        contentEn:
          "Cyber security is the practice of protecting systems, networks, programs and data from digital attacks. It revolves around the **CIA triad**: Confidentiality, Integrity and Availability.",
        xp: 50,
        passScore: 70,
        published: true,
        quiz: [
          {
            id: "q1",
            type: "mcq",
            questionAr: "ماذا يعني الحرف C في مثلث CIA في الأمن السيبراني؟",
            questionEn: "What does the 'C' in the CIA triad stand for?",
            options: [
              { ar: "السرية (Confidentiality)", en: "Confidentiality" },
              { ar: "التشفير (Cipher)", en: "Cipher" },
              { ar: "الشهادة (Certificate)", en: "Certificate" },
            ],
            correctIndex: 0,
            explanationAr: "C تعني السرية: ضمان أن البيانات لا يصل إليها إلا الأشخاص المصرح لهم.",
            explanationEn: "C stands for Confidentiality: ensuring data is only accessed by authorized parties.",
          },
          {
            id: "q2",
            type: "mcq",
            questionAr: "أي مما يلي يهدف للتأكد من أن البيانات لم تُعدّل أثناء النقل؟",
            questionEn: "Which goal ensures data was not altered in transit?",
            options: [
              { ar: "السلامة (Integrity)", en: "Integrity" },
              { ar: "التوافر (Availability)", en: "Availability" },
              { ar: "إخفاء الهوية", en: "Anonymity" },
            ],
            correctIndex: 0,
            explanationAr: "السلامة (Integrity) تعني ضمان عدم التلاعب بالبيانات.",
            explanationEn: "Integrity guarantees the data has not been tampered with.",
          },
        ],
      },
      {
        id: "lesson-1-2",
        levelId: "level-1",
        order: 2,
        titleAr: "أنواع المخترقين والهجمات",
        titleEn: "Hackers & Attack Types",
        descriptionAr: "الفريق الأحمر والأزرق، المخترق الأخلاقي، والفرق بينه وبين المجرم.",
        descriptionEn: "Red vs. blue teams, ethical hackers vs. malicious actors.",
        contentAr:
          "يُصنّف المخترقون إلى ثلاثة أنواع: القبعة البيضاء (White Hat) الأخلاقي الذي يحمي الأنظمة، القبعة السوداء (Black Hat) المجرم، والقبعة الرمادية (Grey Hat) بينهما. ويعمل الفريق الأحمر على الهجوم والفريق الأزرق على الدفاع.",
        contentEn:
          "Hackers are classified as White Hat (ethical defenders), Black Hat (criminals) and Grey Hat (in-between). Red teams attack, blue teams defend.",
        xp: 50,
        passScore: 70,
        published: true,
        quiz: [
          {
            id: "q1",
            type: "mcq",
            questionAr: "من هو المخترق الأخلاقي (White Hat)؟",
            questionEn: "Who is a White Hat hacker?",
            options: [
              { ar: "خبير أمني يخترق بموافقة لاختبار الحماية وإصلاح الثغرات", en: "A security expert who tests systems with permission to fix flaws" },
              { ar: "مجرم يسرق البيانات", en: "A criminal who steals data" },
              { ar: "مستخدم عادي", en: "A regular user" },
            ],
            correctIndex: 0,
            explanationAr: "المخترق الأخلاقي يعمل بإذن وبهدف تحسين الأمان.",
            explanationEn: "An ethical hacker works with authorization to improve security.",
          },
        ],
      },
    ],
  },
  {
    id: "level-2",
    order: 2,
    titleAr: "المرحلة 2: أساسيات الشبكات",
    titleEn: "Stage 2: Networking Basics",
    descriptionAr: "عناوين IP، المنافذ، والبروتوكولات الأساسية التي تبني عليها الهجمات والدفاعات.",
    descriptionEn: "IP addresses, ports, and core protocols behind attacks and defenses.",
    published: true,
    lessons: [
      {
        id: "lesson-2-1",
        levelId: "level-2",
        order: 1,
        titleAr: "عناوين IP والمنافذ",
        titleEn: "IP Addresses & Ports",
        descriptionAr: "كيف تتواصل الأجهزة؟ وما هي المنافذ الشهيرة مثل 80 و 443 و 22؟",
        descriptionEn: "How devices communicate and famous ports (80, 443, 22).",
        contentAr:
          "عنوان IP هو معرّف رقمي للجهاز على الشبكة، أما المنفذ (Port) فيميّز الخدمة. المنفذ 80 لخدمة HTTP، و443 لـ HTTPS، و22 لـ SSH، و21 لـ FTP.",
        contentEn:
          "An IP address identifies a device on a network; a port identifies a service. Port 80 = HTTP, 443 = HTTPS, 22 = SSH, 21 = FTP.",
        xp: 50,
        passScore: 70,
        published: true,
        quiz: [
          {
            id: "q1",
            type: "mcq",
            questionAr: "أي منفذ يُستخدم افتراضياً لخدمة HTTPS الآمنة؟",
            questionEn: "Which port is used by default for secure HTTPS?",
            options: [
              { ar: "443", en: "443" },
              { ar: "21", en: "21" },
              { ar: "25", en: "25" },
            ],
            correctIndex: 0,
            explanationAr: "المنفذ 443 هو الافتراضي لـ HTTPS.",
            explanationEn: "Port 443 is the default for HTTPS.",
          },
          {
            id: "q2",
            type: "terminal",
            questionAr: "أظهر عنوان الـ IP الخاص بجهازك على ويندوز.",
            questionEn: "Display your machine's IP configuration on Windows.",
            terminalPromptAr: "اكتب الأمر الصحيح في الطرفية:",
            terminalPromptEn: "Type the correct command in the terminal:",
            acceptedAnswers: ["ipconfig", "ipconfig /all"],
            explanationAr: "الأمر ipconfig يعرض إعدادات الشبكة وعنوان IP.",
            explanationEn: "ipconfig shows the network configuration and IP address.",
          },
        ],
      },
    ],
  },
  {
    id: "level-3",
    order: 3,
    titleAr: "المرحلة 3: لينكس للمخترق",
    titleEn: "Stage 3: Linux for Hackers",
    descriptionAr: "التنقل في الطرفية، إدارة الملفات، والصلاحيات — أساس كل أدوات الأمن.",
    descriptionEn: "Terminal navigation, file management and permissions — the base of every security tool.",
    published: true,
    lessons: [
      {
        id: "lesson-3-1",
        levelId: "level-3",
        order: 1,
        titleAr: "أوامر التنقل الأساسية",
        titleEn: "Basic Navigation Commands",
        descriptionAr: "ls و pwd و cd للتنقل بين المجلدات باحتراف.",
        descriptionEn: "ls, pwd and cd to move around like a pro.",
        contentAr:
          "`pwd` يعرض المسار الحالي، `ls` يسرد الملفات، و`cd` للتنقل بين المجلدات. هذه الأوامر أول ما تتعلمه في أي توزيعة لينكس.",
        contentEn:
          "`pwd` prints the current path, `ls` lists files, and `cd` changes directories. These are the first commands in any Linux distro.",
        xp: 50,
        passScore: 70,
        published: true,
        quiz: [
          {
            id: "q1",
            type: "terminal",
            questionAr: "اعرض جميع الملفات والمجلدات في المسار الحالي.",
            questionEn: "List all files and folders in the current directory.",
            terminalPromptAr: "اكتب الأمر في الطرفية:",
            terminalPromptEn: "Type the command in the terminal:",
            acceptedAnswers: ["ls", "ls -la", "ls -l", "dir"],
            explanationAr: "الأمر ls يسرد محتويات المجلد الحالي.",
            explanationEn: "The `ls` command lists the current directory contents.",
          },
        ],
      },
      {
        id: "lesson-3-2",
        levelId: "level-3",
        order: 2,
        titleAr: "الصلاحيات والأمان",
        titleEn: "Permissions & Security",
        descriptionAr: "فهم صلاحيات الملفات (rwx) وأمر chmod ولماذا الصلاحيات الخاطئة خطر أمني.",
        descriptionEn: "Understanding rwx file permissions, chmod, and why bad permissions are a security risk.",
        contentAr:
          "كل ملف له صلاحيات للقراءة (r) والكتابة (w) والتنفيذ (x) لكل من المالك والمجموعة والآخرين. الأمر `chmod 755 file` يعطي المالك كل الصلاحيات.",
        contentEn:
          "Every file has read (r), write (w) and execute (x) permissions for owner, group and others. `chmod 755 file` gives the owner full rights.",
        xp: 50,
        passScore: 70,
        published: true,
        quiz: [
          {
            id: "q1",
            type: "mcq",
            questionAr: "ماذا يرمز الحرف x في صلاحيات الملفات؟",
            questionEn: "What does the 'x' permission stand for?",
            options: [
              { ar: "التنفيذ (Execute)", en: "Execute" },
              { ar: "القراءة (Read)", en: "Read" },
              { ar: "الكتابة (Write)", en: "Write" },
            ],
            correctIndex: 0,
            explanationAr: "x تعني صلاحية تشغيل/تنفيذ الملف.",
            explanationEn: "x means the file can be executed.",
          },
        ],
      },
    ],
  },
  {
    id: "level-4",
    order: 4,
    titleAr: "المرحلة 4: أمن الويب",
    titleEn: "Stage 4: Web Security",
    descriptionAr: "أشهر ثغرات الويب (OWASP Top 10)، وحقن SQL وكيفية اكتشاف الفلاج.",
    descriptionEn: "Top web vulnerabilities (OWASP Top 10), SQL Injection and capturing flags.",
    published: true,
    lessons: [
      {
        id: "lesson-4-1",
        levelId: "level-4",
        order: 1,
        titleAr: "مقدمة OWASP Top 10",
        titleEn: "OWASP Top 10 Intro",
        descriptionAr: "أخطر 10 ثغرات في تطبيقات الويب وكيف يفكر المهاجم.",
        descriptionEn: "The 10 most critical web app vulnerabilities and how attackers think.",
        contentAr:
          "قائمة OWASP Top 10 تضم أشهر ثغرات الويب مثل: كسر التحكم في الوصول (Broken Access Control)، وحقن SQL، والبرمجة النصية عبر المواقع (XSS).",
        contentEn:
          "The OWASP Top 10 lists critical web flaws: Broken Access Control, SQL Injection and Cross-Site Scripting (XSS).",
        xp: 60,
        passScore: 70,
        published: true,
        quiz: [
          {
            id: "q1",
            type: "mcq",
            questionAr: "ما هي ثغرة XSS؟",
            questionEn: "What is an XSS vulnerability?",
            options: [
              { ar: "حقن كود JavaScript ضار في صفحة يشاهدها مستخدمون آخرون", en: "Injecting malicious JavaScript into a page seen by other users" },
              { ar: "سرقة كلمات المرور من قاعدة البيانات", en: "Stealing passwords from the database" },
              { ar: "تعطيل الخادم بالكامل", en: "Taking the whole server down" },
            ],
            correctIndex: 0,
            explanationAr: "XSS = Cross-Site Scripting، حقن سكربت في متصفح الضحية.",
            explanationEn: "XSS = Cross-Site Scripting, injecting a script into the victim's browser.",
          },
          {
            id: "q2",
            type: "flag",
            questionAr: "التقط الفلاج المخفي في هذا السؤال: CYBER{Welcome_To_Web_Security}",
            questionEn: "Capture the hidden flag in this question: CYBER{Welcome_To_Web_Security}",
            expectedFlag: "CYBER{Welcome_To_Web_Security}",
            explanationAr: "أحسنت! هذا هو أسلوب Capture The Flag (CTF).",
            explanationEn: "Well done! That is the Capture The Flag (CTF) style.",
          },
        ],
      },
      {
        id: "lesson-4-2",
        levelId: "level-4",
        order: 2,
        titleAr: "حقن SQL (SQL Injection)",
        titleEn: "SQL Injection",
        descriptionAr: "كيف تتلاعب المدخلات باستعلام قاعدة البيانات، وكيف تحمي منها.",
        descriptionEn: "How user input manipulates DB queries and how to prevent it.",
        contentAr:
          "حقن SQL يحدث عندما يُدخل المستخدم كود SQL في حقل إدخال ليغيّر الاستعلام. مثال شهير: `' OR '1'='1`. الحل: الاستعلامات المُعدّة (Prepared Statements).",
        contentEn:
          "SQL Injection happens when a user injects SQL through an input field. A classic payload: `' OR '1'='1`. Fix: prepared statements.",
        xp: 60,
        passScore: 70,
        published: true,
        quiz: [
          {
            id: "q1",
            type: "mcq",
            questionAr: "ما أفضل طريقة للحماية من حقن SQL؟",
            questionEn: "What is the best way to prevent SQL Injection?",
            options: [
              { ar: "استخدام الاستعلامات المُعدّة (Prepared Statements)", en: "Use prepared statements / parameterized queries" },
              { ar: "إخفاء رسائل الخطأ فقط", en: "Only hide error messages" },
              { ar: "تغيير اسم قاعدة البيانات", en: "Rename the database" },
            ],
            correctIndex: 0,
            explanationAr: "الاستعلامات المُعدّة تفصل البيانات عن كود SQL نهائياً.",
            explanationEn: "Prepared statements strictly separate data from SQL code.",
          },
        ],
      },
    ],
  },
  {
    id: "level-5",
    order: 5,
    titleAr: "المرحلة 5: التشفير والأدوات",
    titleEn: "Stage 5: Cryptography & Tooling",
    descriptionAr: "أساسيات التشفير، تشفير قيصر، وقوة كلمات المرور.",
    descriptionEn: "Crypto basics, Caesar cipher, and password strength.",
    published: true,
    lessons: [
      {
        id: "lesson-5-1",
        levelId: "level-5",
        order: 1,
        titleAr: "أساسيات التشفير",
        titleEn: "Cryptography Basics",
        descriptionAr: "الفرق بين التشفير المتماثل وغير المتماثل والهاش.",
        descriptionEn: "Symmetric vs. asymmetric encryption and hashing.",
        contentAr:
          "التشفير المتماثل يستخدم مفتاحاً واحداً، وغير المتماثل يستخدم مفتاحين (عام وخاص). أما الهاش (Hash) فهو دالة أحادية الاتجاه مثل SHA-256.",
        contentEn:
          "Symmetric encryption uses one key; asymmetric uses a key pair (public/private). A hash is a one-way function like SHA-256.",
        xp: 60,
        passScore: 70,
        published: true,
        quiz: [
          {
            id: "q1",
            type: "mcq",
            questionAr: "أي مما يلي دالة هاش أحادية الاتجاه؟",
            questionEn: "Which of the following is a one-way hash function?",
            options: [
              { ar: "SHA-256", en: "SHA-256" },
              { ar: "AES", en: "AES" },
              { ar: "RSA", en: "RSA" },
            ],
            correctIndex: 0,
            explanationAr: "SHA-256 دالة هاش لا يمكن عكسها.",
            explanationEn: "SHA-256 is a hash function that cannot be reversed.",
          },
        ],
      },
    ],
  },
];

export const SEED_CHALLENGES: Challenge[] = [
  {
    id: "challenge-1",
    titleAr: "أول أمر في الطرفية",
    titleEn: "Your First Terminal Command",
    difficulty: "easy",
    xp: 30,
    hintAr: "الأمر يتكون من حرفين للعرض.",
    hintEn: "The command is only two letters to list.",
    published: true,
    question: {
      id: "c1-q1",
      type: "terminal",
      questionAr: "اعرض محتويات المجلد الحالي في الطرفية.",
      questionEn: "List the contents of the current directory.",
      terminalPromptAr: "اكتب الأمر:",
      terminalPromptEn: "Type the command:",
      acceptedAnswers: ["ls", "ls -la", "ls -l"],
      explanationAr: "الأمر ls يعرض الملفات في المجلد الحالي.",
      explanationEn: "`ls` lists the files in the current directory.",
    },
  },
  {
    id: "challenge-2",
    titleAr: "عالم عناوين IP",
    titleEn: "The World of IP",
    difficulty: "easy",
    xp: 30,
    hintAr: "فكر في إصدار البروتوكول الحديث.",
    hintEn: "Think of the modern protocol version.",
    published: true,
    question: {
      id: "c2-q1",
      type: "mcq",
      questionAr: "أي عنوان IP التالي يتبع الإصدار IPv6؟",
      questionEn: "Which of these is an IPv6 address?",
      options: [
        { ar: "2001:0db8:85a3::8a2e:0370:7334", en: "2001:0db8:85a3::8a2e:0370:7334" },
        { ar: "192.168.1.1", en: "192.168.1.1" },
        { ar: "10.0.0.255", en: "10.0.0.255" },
      ],
      correctIndex: 0,
      explanationAr: "IPv6 يستخدم النظام الست عشري ويفصل بعلامات النقطتين.",
      explanationEn: "IPv6 uses hexadecimal notation separated by colons.",
    },
  },
  {
    id: "challenge-3",
    titleAr: "فلاج الشبكة",
    titleEn: "Network Flag",
    difficulty: "easy",
    xp: 30,
    hintAr: "الفلاج مكتوب داخل نص السؤال.",
    hintEn: "The flag is written inside the question text.",
    published: true,
    question: {
      id: "c3-q1",
      type: "flag",
      questionAr: "استخرج الفلاج: CYBER{n3tw0rk_b4s1cs}",
      questionEn: "Extract the flag: CYBER{n3tw0rk_b4s1cs}",
      expectedFlag: "CYBER{n3tw0rk_b4s1cs}",
      explanationAr: "الفلاج يمثل تحدياً نمطياً في مسابقات CTF.",
      explanationEn: "Flags are the standard scoring token in CTF competitions.",
    },
  },
  {
    id: "challenge-4",
    titleAr: "اختراق بسيط",
    titleEn: "Simple Injection",
    difficulty: "medium",
    xp: 40,
    hintAr: "استخدم `' OR '1'='1` لتجاوز شرط الدخول.",
    hintEn: "Use `' OR '1'='1` to bypass the login condition.",
    published: true,
    question: {
      id: "c4-q1",
      type: "flag",
      questionAr: "بعد تجاوز تسجيل الدخول بحقن SQL ظهر الفلاج: CYBER{sql_1nj3ct10n_pwn3d}. اكتبه:",
      questionEn: "After bypassing login with SQL injection the flag appeared: CYBER{sql_1nj3ct10n_pwn3d}. Type it:",
      expectedFlag: "CYBER{sql_1nj3ct10n_pwn3d}",
      explanationAr: "حقن SQL قد يسمح بتجاوز المصادقة بالكامل.",
      explanationEn: "SQL injection can fully bypass authentication.",
    },
  },
  {
    id: "challenge-5",
    titleAr: "كلمة مرور قوية",
    titleEn: "Strong Password",
    difficulty: "easy",
    xp: 30,
    hintAr: "الأطول والأكثر تنويعاً هو الأقوى.",
    hintEn: "The longest with the most variety is strongest.",
    published: true,
    question: {
      id: "c5-q1",
      type: "mcq",
      questionAr: "أي كلمة مرور هي الأقوى؟",
      questionEn: "Which password is the strongest?",
      options: [
        { ar: "Tr0ub4dor&3!xZ", en: "Tr0ub4dor&3!xZ" },
        { ar: "12345678", en: "12345678" },
        { ar: "password", en: "password" },
      ],
      correctIndex: 0,
      explanationAr: "الطول والتنويع (حروف كبيرة وصغيرة وأرقام ورموز) يقوّيان كلمة المرور.",
      explanationEn: "Length and variety (cases, digits, symbols) make a password strong.",
    },
  },
  {
    id: "challenge-6",
    titleAr: "قراءة الملفات",
    titleEn: "Reading Files",
    difficulty: "easy",
    xp: 30,
    hintAr: "الأمر cat لقراءة الملفات.",
    hintEn: "The cat command reads files.",
    published: true,
    question: {
      id: "c6-q1",
      type: "terminal",
      questionAr: "اطبع محتوى الملف secret.txt.",
      questionEn: "Print the contents of secret.txt.",
      terminalPromptAr: "اكتب الأمر:",
      terminalPromptEn: "Type the command:",
      acceptedAnswers: ["cat secret.txt", "cat ./secret.txt", "less secret.txt"],
      explanationAr: "الأمر cat يعرض محتوى الملف في الطرفية.",
      explanationEn: "`cat` prints a file's contents to the terminal.",
    },
  },
  {
    id: "challenge-7",
    titleAr: "فتح المنافذ",
    titleEn: "Opening Ports",
    difficulty: "medium",
    xp: 40,
    hintAr: "أداة فحص المنافذ الشهيرة تبدأ بحرف n.",
    hintEn: "The famous port scanner starts with n.",
    published: true,
    question: {
      id: "c7-q1",
      type: "mcq",
      questionAr: "ما الأداة الشهيرة لفحص المنافذ المفتوحة؟",
      questionEn: "Which tool is famous for scanning open ports?",
      options: [
        { ar: "nmap", en: "nmap" },
        { ar: "notepad", en: "notepad" },
        { ar: "excel", en: "excel" },
      ],
      correctIndex: 0,
      explanationAr: "nmap أداة أساسية لاستكشاف الشبكات وفحص المنافذ.",
      explanationEn: "nmap is a core tool for network discovery and port scanning.",
    },
  },
  {
    id: "challenge-8",
    titleAr: "اكتب سكربت فحص",
    titleEn: "Write a Scanner",
    difficulty: "hard",
    xp: 50,
    hintAr: "استخدم حلقة for وطباعة كل منفذ من 1 إلى 5.",
    hintEn: "Use a for loop printing ports 1 to 5.",
    published: true,
    question: {
      id: "c8-q1",
      type: "code",
      questionAr: "اكتب كود Python يطبع أرقام المنافذ من 1 إلى 5 باستخدام حلقة for.",
      questionEn: "Write Python code that prints port numbers 1 to 5 using a for loop.",
      language: "python",
      starterCode: "for port in range(1, 6):\n    ",
      expectedPattern: "for\\s+\\w+\\s+in\\s+range\\(\\s*1\\s*,\\s*6\\s*\\)\\s*:",
      explanationAr: "حلقة for مع range(1, 6) تطبع الأرقام من 1 إلى 5.",
      explanationEn: "A for loop with range(1, 6) prints numbers 1 to 5.",
    },
  },
];

/** Count how many full stages the learner has finished. */
export function countCompletedLevels(
  completedLessonIds: string[],
  levels: Level[] = SEED_LEVELS
): number {
  return levels.filter((lvl) => isLevelComplete(lvl, completedLessonIds)).length;
}

/** Total number of lessons across the given stages (defaults to the seed). */
export function totalLessonsIn(levels: Level[] = SEED_LEVELS): number {
  return levels.reduce((sum, lvl) => sum + (lvl.lessons?.length || 0), 0);
}

/** Flat list of every lesson across all stages. */
export const ALL_LESSONS: Lesson[] = SEED_LEVELS.flatMap((lvl) => lvl.lessons);

/** Total number of lessons in the published roadmap. */
export const TOTAL_LESSONS = ALL_LESSONS.length;
