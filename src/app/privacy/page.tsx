"use client";

import React from "react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { Shield, ShieldAlert } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Badge variant="blue" size="md" className="mb-2">
            <Shield className="w-4 h-4" />
            <span>الخصوصية والأمان</span>
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0A0A0A]">
            <HandDrawnUnderline>سياسة الخصوصية</HandDrawnUnderline>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-700 mt-2">
            آخر تحديث: 2026
          </p>
        </div>

        <Card variant="white" className="p-8 space-y-6 shadow-[8px_8px_0px_#0A0A0A] font-bold text-sm leading-relaxed text-gray-800">
          <div className="p-4 bg-yellow-50 border-2 border-[#FACC15] flex items-start gap-3 text-xs sm:text-sm text-[#0A0A0A]">
            <ShieldAlert className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
            <div>
              <span className="font-black block mb-0.5">تنبيه هام للمستخدمين دون سن 13 عاماً:</span>
              نرحب بالمتعلّمين الصغار لتنمية مهاراتهم في الأمن السيبراني والتفكير الأمني، ونشترط موافقة وإشراف ولي الأمر عند التسجيل واستخدام المنصة.
            </div>
          </div>

          <div>
            <h3 className="font-black text-lg text-[#0A0A0A] mb-2">1. جمع البيانات</h3>
            <p>
              تجمع المنصة فقط البيانات الأساسية اللازمة لتقديم الخدمة التعليمية والتلعيب: البريد الإلكتروني، اسم العرض، الفئة العمرية، ونقاط التقدم (XP والستريك). لا نجمع أي بيانات بنكية أو بطاقات ائتمانية إطلاقاً لأن المنصة مجانية بالكامل.
            </p>
          </div>

          <div>
            <h3 className="font-black text-lg text-[#0A0A0A] mb-2">2. حماية الخصوصية ولوحة المتصدرين</h3>
            <p>
              يظهر في لوحة المتصدرين اسم العرض والأفاتار ونقاط الـ XP فقط. لا يتم عرض أي بريد إلكتروني أو بيانات تواصل للعامة نهائياً.
            </p>
          </div>

          <div>
            <h3 className="font-black text-lg text-[#0A0A0A] mb-2">3. ملفات تعريف الارتباط والخدمات المدمجة</h3>
            <p>
              نستخدم مشغل YouTube في وضع تعزيز الخصوصية (privacy-enhanced mode) لعرض الفيديوهات التعليمية بدون تتبع خارجي غير مصرح به.
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
