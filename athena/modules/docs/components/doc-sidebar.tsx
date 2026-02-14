"use client";

import { cn } from "@/lib/utils";
import {
  Shield,
  AlertTriangle,
  Book,
  Package,
  Languages,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface DocLink {
  titleKey: string;
  href: string;
}

interface CollapsibleSection {
  id: string;
  titleKey: string;
  icon: React.ElementType;
  basePath: string;
  links: DocLink[];
}

const i18nLinks: DocLink[] = [
  {
    titleKey: "modules.docs.sidebar.i18n.overview",
    href: "/docs/i18n#overview",
  },
  { titleKey: "modules.docs.sidebar.i18n.setup", href: "/docs/i18n#setup" },
  {
    titleKey: "modules.docs.sidebar.i18n.configuration",
    href: "/docs/i18n#configuration",
  },
  { titleKey: "modules.docs.sidebar.i18n.usage", href: "/docs/i18n#usage" },
];

const errorLinks: DocLink[] = [
  {
    titleKey: "modules.docs.sidebar.error.overview",
    href: "/docs/error-handling#overview",
  },
  {
    titleKey: "modules.docs.sidebar.error.installation",
    href: "/docs/error-handling#installation",
  },
  {
    titleKey: "modules.docs.sidebar.error.environmentSetup",
    href: "/docs/error-handling#environment-setup",
  },
  {
    titleKey: "modules.docs.sidebar.error.basicSetup",
    href: "/docs/error-handling#basic-setup",
  },
  {
    titleKey: "modules.docs.sidebar.error.advancedConfig",
    href: "/docs/error-handling#advanced-configuration",
  },
  {
    titleKey: "modules.docs.sidebar.error.manualReporting",
    href: "/docs/error-handling#manual-reporting",
  },
  {
    titleKey: "modules.docs.sidebar.error.viewingErrors",
    href: "/docs/error-handling#viewing-errors",
  },
];

export function DocSidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const [hash, setHash] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    i18n: pathname.startsWith("/docs/i18n"),
    error: pathname.startsWith("/docs/error-handling"),
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHash(typeof window !== "undefined" ? window.location.hash : "");
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isLinkActive = (href: string) => {
    const [path, hashPart] = href.split("#");
    const linkHash = hashPart ? `#${hashPart}` : "";
    const pathMatches = pathname === path;
    if (!pathMatches) return false;
    if (linkHash) return hash === linkHash;
    return hash === "" || hash === linkHash;
  };

  const topLinks = [
    {
      titleKey: "modules.docs.sidebar.gettingStarted",
      href: "/docs",
      icon: Book,
    },
    {
      titleKey: "modules.docs.sidebar.authentication",
      href: "/docs/authentication",
      icon: Shield,
    },
  ];

  const collapsibleSections: CollapsibleSection[] = [
    {
      id: "i18n",
      titleKey: "modules.docs.sidebar.i18nModule",
      icon: Languages,
      basePath: "/docs/i18n",
      links: i18nLinks,
    },
    {
      id: "error",
      titleKey: "modules.docs.sidebar.errorModule",
      icon: AlertTriangle,
      basePath: "/docs/error-handling",
      links: errorLinks,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 shrink-0 overflow-y-auto border-r border-border bg-card/50 p-6">
      <h2 className="text-lg font-semibold mb-4">{t("modules.docs.title")}</h2>
      <nav className="space-y-0.5">
        {topLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(link.titleKey)}
            </Link>
          );
        })}

        {collapsibleSections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSections[section.id] ?? false;
          const isSectionActive = pathname.startsWith(section.basePath);

          return (
            <div key={section.id} className="pt-1">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isSectionActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <span className="shrink-0 w-4 flex justify-center">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{t(section.titleKey)}</span>
              </button>
              {isOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-3 py-1">
                  {section.links.map((link) => {
                    const active = isLinkActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "block rounded-lg px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        {t(link.titleKey)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
