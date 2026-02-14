"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "typescript", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg border border-border bg-muted/50 overflow-hidden">
      {filename && (
        <div className="px-4 py-2 border-b border-border bg-muted/80 text-sm text-muted-foreground font-mono">
          {filename}
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className={cn(
            "absolute right-2 top-2 p-2 rounded-md transition-all",
            "bg-background/80 border border-border",
            "hover:bg-background opacity-0 group-hover:opacity-100"
          )}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <pre className="p-4 overflow-x-auto">
          <code className={`language-${language} text-sm`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
