import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ContentProvider } from "@/context/ContentContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://learn-to-beats.vercel.app"),
  title: "هنتعلم سايبر سيكيورتي | منصة تعلم الأمن السيبراني من الصفر",
  description: "منصة عربية مجانية بالكامل لتعلم الأمن السيبراني خطوة بخطوة: دروس مبسطة، طرفية تفاعلية، تحديات Flags بأسلوب CTF، مختبر اختراق أخلاقي داخل المتصفح، وشهادة إتمام موثقة.",
  keywords: ["أمن سيبراني", "تعلم الأمن السيبراني", "هاكر أخلاقي", "cyber security", "ethical hacking", "capture the flag", "CTF", "لينكس", "هنتعلم سايبر سيكيورتي"],
  authors: [{ name: "هنتعلم سايبر سيكيورتي" }],
  openGraph: {
    title: "هنتعلم سايبر سيكيورتي | تعلّم الأمن السيبراني من الصفر… لحد ما نجيب فلوس",
    description: "دروس مبسطة، طرفية محاكاة، تحديات التقاط Flags، مختبر سايبر آمن، وشهادة إتمام — مجاناً بالكامل.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Self-hosted fonts (see globals.css). Preloaded to avoid a flash of
            fallback text on first paint. */}
        <link
          rel="preload"
          href="/fonts/cairo-arabic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/cairo-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#FAF6EC] text-[#0A0A0A] antialiased selection:bg-[#FACC15] selection:text-[#0A0A0A]">
        <LanguageProvider>
          <ContentProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ContentProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
