import "@/styles/globals.css";

import type { Metadata } from "next";
import Script from "next/script";

import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "吃什么 - 大学城美食地图",
  description: "大学生专属美食决策助手"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Script id="amap-security" strategy="beforeInteractive">
          {`
            window._AMapSecurityConfig = {
              securityJsCode: '${process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE}',
            };
          `}
        </Script>
        <Script
          src={`https://webapi.amap.com/maps?v=2.0&key=${process.env.NEXT_PUBLIC_AMAP_KEY}`}
          strategy="beforeInteractive"
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
