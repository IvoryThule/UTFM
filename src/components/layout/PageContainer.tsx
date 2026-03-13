import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return <main className="mx-auto w-full max-w-md px-4 pb-24 pt-4">{children}</main>;
}
