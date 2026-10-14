"use client";

import React from "react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { BookCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Badge variant="yellow" size="md" className="mb-2">
            <BookCheck className="w-4 h-4 text-[#0A0A0A]" />
            <span>الشروط والأحكام</span>
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0A0A0A]">
            <HandDrawnUnderline>شروط الاستخدام</HandDrawnUnderline>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-700 mt-2">
            اتفاقية استخدام منصة Learn Cyber Security
          </p>
        </div>

        <Card variant="white" className="p-8 space-y-6 shadow-[8px_8px_0px_#0A0A0A] font-bold text-sm leading-relaxed text-gray-800">
          <div>
            <h3 className="font-black text-lg text-[#0A0A0A] mb-2">1. طبيعة المنصة المجانية</h3>
            <p>
              منصة Learn Cyber Security هي مبادرة تعليمية مجانية 100% تهدف لنشر وتسهيل تعلّم الأمن السيبراني لجميع الفئات باللغة العربية والإنجليزية. لا توجد أي خطط مدفوعة أو رسوم خفية.
            </p>
          </div>

          <div>
            <h3 className="font-black text-lg text-[#0A0A0A] mb-2">2. السلوك واللعب النظيف</h3>
            <p>
              يحظر التلاعب بنقاط الـ XP أو محاولة الغش البرمجي في التحديات أو الكويزات أو لوحة المتصدرين. يحتفظ مشرفو المنصة بحق حظر أي حساب يخالف قواعد الاستخدام النظيف.
            </p>
          </div>

          <div>
            <h3 className="font-black text-lg text-[#0A0A0A] mb-2">3. الملكية الفكرية والشهادات</h3>
            <p>
              الشهادات الصادرة من المنصة هي شهادات إتمام تخرج رمزية موثقة برقم تحقق إلكتروني فريد يشهد باجتياز الطالب للمسار التعليمي وكويزاته بنجاح.
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
