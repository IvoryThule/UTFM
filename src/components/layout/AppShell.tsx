import type { ReactNode } from "react";

import BottomNav from "./BottomNav";
import PageContainer from "./PageContainer";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <PageContainer>{children}</PageContainer>
      <BottomNav />
    </div>
  );
}
