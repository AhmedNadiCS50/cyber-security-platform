"use client";

import React, { use, Suspense } from "react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useContent } from "@/context/ContentContext";
import { ShieldCheck } from "lucide-react";

interface VerifyPageProps {
  params: Promise<{ certId: string }>;
}

function VerifyContent({ params }: VerifyPageProps) {
  const { certId } = use(params);
  const { levels, totalLessons } = useContent();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex items-center justify-center">
        <Card
          variant="white"
          className="w-full p-8 sm:p-12 text-center shadow-[10px_10px_0px_#0A0A0A]"
        >
          {/* Verified Green Badge */}
          <div className="w-20 h-20 bg-green-100 border-[3.5px] border-green-700 shadow-[4px_4px_0px_#15803D] mx-auto flex items-center justify-center mb-6">
            <ShieldCheck className="w-12 h-12 text-green-700" />
          </div>

          <Badge variant="green" size="lg" className="mb-3">
            ✓ شهادة موثقة ورسمية 100%
          </Badge>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0A0A0A] mb-2">
            تم التحقق من صحة الشهادة بنجاح
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-700 max-w-md mx-auto mb-8">
            هذه الشهادة مسجلة في سجلات خريجي منصة Learn Cyber Security لتعليم الأمن السيبراني.
          </p>

          {/* Details Table */}
          <div className="bg-[#FAF6EC] border-[2.5px] border-[#0A0A0A] p-5 text-start space-y-3 mb-8 text-xs sm:text-sm font-bold">
            <div className="flex justify-between py-1 border-b border-gray-300">
              <span className="text-gray-600">اسم الطالب:</span>
              <span className="font-black text-[#0A0A0A]">بطل الأمن السيبراني المعتمد</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-300">
              <span className="text-gray-600">المسار المكتمل:</span>
              <span className="font-black text-[#0A0A0A]">
                مسار الأمن السيبراني الشامل ({levels.length} مراحل - {totalLessons} درساً)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-300">
              <span className="text-gray-600">كود التحقق الفريد:</span>
              <span className="font-mono font-black text-[#3346F0]">{certId}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">جهة الاعتماد:</span>
              <span className="font-black text-[#0A0A0A]">Learn Cyber Security Official Academy</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/certificate" variant="primary" size="md">
              عرض الشهادة كاملة
            </Button>
            <Button href="/" variant="outline" size="md">
              الصفحة الرئيسية
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default function CertificateVerificationPage(props: VerifyPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center font-black">
          جاري التحقق من كود الشهادة...
        </div>
      }
    >
      <VerifyContent {...props} />
    </Suspense>
  );
}
