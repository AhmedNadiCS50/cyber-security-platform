# 🚀 دليل النشر على Vercel

## المتطلبات المسبقة
- حساب على [GitHub](https://github.com) (مجاني)
- حساب على [Vercel](https://vercel.com) (مجاني) — اربطه بـ GitHub
- مشروع Firebase مفعل (Authentication + Firestore + Storage)

---

## 1️⃣ رفع الكود لـ GitHub

### الخيار أ: من سطر الأوامر (إذا كنت تعرف Git)
```bash
cd "E:\منصة تعلم الشطرنج"
git init
git add .
git commit -m "Initial commit: Cyber Security Platform"
# أنشئ repo على GitHub ثم:
git remote add origin https://github.com/YOUR_USERNAME/cyber-security-platform.git
git branch -M main
git push -u origin main
```

### الخيار ب: من واجهة GitHub (أسهل لغير المبرمجين)
1. ادخل [github.com/new](https://github.com/new)
2. اسم المستودع: `cyber-security-platform`
3. **Public** أو **Private** (كلاهما يعمل مع Vercel المجاني)
4. **لا** تختر "Add a README file" أو ".gitignore" أو "license"
5. اضغط **Create repository**
6. في صفحة التعليمات، انسخ رابط الـ HTTPS (مثلاً: `https://github.com/username/cyber-security-platform.git`)
7. افتح **PowerShell** أو **Command Prompt** في مجلد المشروع:
```powershell
cd "E:\منصة تعلم الشطرنج"
git init
git add .
git commit -m "Initial commit: Cyber Security Platform"
git remote add origin https://github.com/YOUR_USERNAME/cyber-security-platform.git
git branch -M main
git push -u origin main
```

---

## 2️⃣ ربط المشروع بـ Vercel

1. ادخل [vercel.com/new](https://vercel.com/new)
2. اضغط **Import Git Repository**
3. اختر مستودع `cyber-security-platform` من قائمة GitHub
3. اضغط **Import**

### إعدادات المشروع (تظهر تلقائياً):
- **Framework Preset**: Next.js ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

---

## 3️⃣ متغيرات البيئة (Environment Variables) — **مهم جداً!**

في صفحة إعدادات المشروع على Vercel، اذهب إلى **Settings → Environment Variables** وأضف **كل** المتغيرات التالية:

| الاسم | القيمة | البيئة |
|----------|--------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyA5IqTAHf50ifzHriXsW2pLTn4a2cTyJ4o` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `learn-to-beats.firebaseapp.com` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `learn-to-beats` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `learn-to-beats.firebasestorage.app` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `241117682636` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:241117682636:web:e3c2c1742a8f3453a59b69` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-XFMHP3021W` | Production, Preview, Development |
| `NEXT_PUBLIC_OWNER_EMAIL` | `ahmednadics50@gmail.com` | Production, Preview, Development |

⚠️ **اضغط Save لكل متغير** — يجب إضافة الـ 8 متغيرات جميعاً.

---

## 4️⃣ النشر (Deploy)

1. بعد حفظ المتغيرات، اذهب إلى تبويب **Deployments**
2. اضغط **Redeploy** على أحدث deployment أو انتظر النشر التلقائي
3. انتظر 2-3 دقائق حتى يكتمل البناء
4. ستحصل على رابط مثل: `https://cyber-security-platform.vercel.app`

---

## 5️⃣ إعداد Firebase للنطاق الجديد

بعد النشر، ستحصل على نطاق مثل `https://your-project.vercel.app`. يجب إضافته لـ Firebase:

### Firebase Authentication → Settings → Authorized domains
أضف:
- `your-project.vercel.app`
- `vercel.app` (اختياري للمعاينات)

### Firebase Console → Project Settings → General
في قسم **Your apps** → Web app → **Firebase SDK snippet** تأكد أن `authDomain` و `projectId` صحيحة.

### Firestore Rules
القواعد المنشورة مسبقاً ستعمل تلقائياً.

---

## 6️⃣ اختبار الموقع

1. افتح الرابط الجديد
2. جرب تسجيل الدخول بـ `ahmednadics50@gmail.com` (Google)
3. ادخل `/admin` واضغط **"نشر المحتوى الابتدائي"**
4. تأكد أن `/learn` و `/leaderboard` تعملان

---

## 🔧 استكشاف الأخطاء

| المشكلة | الحل |
|----------|------|
| **Build failed: Missing env vars** | تأكد من إضافة الـ 8 متغيرات في Vercel Settings |
| **Firebase: Auth domain not authorized** | أضف نطاق Vercel في Firebase Auth authorized domains |
| **Permission denied on Firestore** | تحقق من `firestore.rules` وأن المستخدم مسجل دخول |
| **Images not loading** | أضف `images.remotePatterns` في `next.config.ts` إذا كنت تستخدم صور خارجية |

---

## 📞 الدعم
إذا واجهت أي مشكلة:
1. راجع **Vercel Build Logs** في تبويب Deployments
2. راجع **Firebase Console → Authentication → Users** للتأكد من إنشاء المستخدم
3. راجع **Firebase Console → Firestore → Data** للتأكد من كتابة البيانات

---

## ✅ خلاصة سريعة
1. ✅ ارفع الكود لـ GitHub
2. ✅ استورد المشروع في Vercel
3. ✅ أضف **8 متغيرات بيئة** في Settings
4. ✅ انشر (Deploy)
4. ✅ أضف نطاق Vercel في Firebase Authorized domains
5. ✅ سجل دخول بالأونر وانشر المحتوى الابتدائي

**الموقع سيعمل على: `https://your-project.vercel.app`** 🎉