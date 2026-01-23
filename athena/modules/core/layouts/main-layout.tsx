"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Settings,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Zap,
  Building2,
  CodeXml,
  Book,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/core/ui/avatar";
import { Button } from "@/modules/core/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/modules/core/ui/tooltip";
import { LanguageSwitcher } from "@/modules/core/components/language-switcher";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { getInitials } from "../lib/format";
import { useTranslations } from "next-intl";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const profile = useQuery(api.profile.getProfile);
  const t = useTranslations();

  const navItems = [
    { icon: Home, label: t("nav.dashboard"), href: "/" },
    { icon: Building2, label: t("nav.organizations"), href: "/organizations" },
    { icon: BarChart3, label: t("nav.analytics"), href: "/analytics" },
    { icon: MessageSquare, label: t("nav.messages"), href: "/messages" },
    { icon: CodeXml, label: t("nav.docs"), href: "/docs" },
    { icon: Settings, label: t("nav.settings"), href: "/settings" },
  ];

  // Hide layout for auth page
  const isAuthPage = pathname === "/auth";

  // If on auth page, just render children without layout
  if (isAuthPage) {
    return <div className="h-screen w-full">{children}</div>;
  }

  return (
    <div className="flex flex-row h-screen w-full bg-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isExpanded ? "w-64" : "w-20"
        } bg-white border-r border-border transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-primary to-orange-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-foreground">
                Athena
              </span>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-primary to-orange-600 flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <TooltipProvider delayDuration={0}>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className="relative">
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`w-full ${
                            isExpanded ? "justify-start" : "justify-center"
                          } h-11 transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                              : "hover:bg-secondary hover:text-secondary-foreground"
                          }`}
                          asChild
                        >
                          <a href={item.href}>
                            <item.icon
                              className={`${isExpanded ? "mr-3" : ""} h-5 w-5 shrink-0`}
                            />
                            {isExpanded && (
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            )}
                          </a>
                        </Button>
                      </TooltipTrigger>
                      {!isExpanded && (
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={() => router.push("/profile")}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer ${
                    !isExpanded && "justify-center"
                  }`}
                >
                  {profile === undefined ? (
                    // Loading state
                    <>
                      <div className="h-9 w-9 shrink-0 rounded-full bg-muted animate-pulse" />
                      {isExpanded && (
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse w-24" />
                          <div className="h-3 bg-muted rounded animate-pulse w-32" />
                        </div>
                      )}
                    </>
                  ) : profile === null ? (
                    // Not logged in
                    <>
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          G
                        </AvatarFallback>
                      </Avatar>
                      {isExpanded && (
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {t("components.user.guest")}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t("components.user.notLoggedIn")}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    // Logged in user
                    <>
                      <Avatar className="h-9 w-9 shrink-0">
                        {profile.image && (
                          <AvatarImage
                            src={profile.image}
                            alt={profile.name || t("components.user.user")}
                          />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(profile.name, profile.email)}
                        </AvatarFallback>
                      </Avatar>
                      {isExpanded && (
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {profile.name || t("components.user.user")}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.email || t("components.user.noEmail")}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TooltipTrigger>
              {!isExpanded && profile && (
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">
                      {profile.name || t("components.user.user")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile.email || t("components.user.noEmail")}
                    </p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Toggle Button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-9 hover:bg-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="text-xs">{t("nav.collapse")}</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">
              {t("nav.dashboard")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="w-px h-6 bg-border" />
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("nav.support")}
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Book className="mr-2 h-4 w-4" />
              {t("nav.docs")}
            </Button>
          </div>
        </header>

        {/* Main Content with Dim Background */}
        <main className="flex-1 overflow-y-auto bg-background-dim">
          {children}
        </main>
      </div>
    </div>
  );
};

export function exportWithMainLayout(Page: React.ComponentType) {
  return function WrappedPage() {
    return (
      <MainLayout>
        <Page />
      </MainLayout>
    );
  };
}
