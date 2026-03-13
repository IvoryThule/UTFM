import Link from "next/link";
import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  backHref?: string;
  rightSlot?: ReactNode;
}

export default function TopBar({ title, backHref, rightSlot }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-md items-center justify-between px-4">
        {backHref ? (
          <Link href={backHref} className="text-sm text-gray-500">
            返回
          </Link>
        ) : (
          <span className="w-8" />
        )}
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
        <div className="min-w-8 text-right text-xs text-gray-500">{rightSlot}</div>
      </div>
    </header>
  );
}
