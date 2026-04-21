"use client";

import { LanguageSwitcher } from "@/modules/core/components/language-switcher";
import { DocSidebar } from "./doc-sidebar";

interface DocLayoutProps {
  children: React.ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  return (
    <div className="min-h-screen">
      <DocSidebar />
      <main className="ml-64 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
