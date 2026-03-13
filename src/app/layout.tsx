import "@/styles/globals.css";

import type { Metadata } from "next";

import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "吃什么 - 大学城美食地图",
  description: "大学生专属美食决策助手"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
