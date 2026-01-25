"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LucideIcon, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/core/ui/avatar";
import { Button, buttonVariants } from "@/modules/core/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/modules/core/ui/tooltip";
import { LanguageSwitcher } from "@/modules/core/components/language-switcher";
import { NotificationBell } from "@/modules/notifications/components/notification-bell";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { getInitials } from "../lib/format";
import { VariantProps } from "class-variance-authority";
import { Logo } from "./logo";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

export type NavButtonType = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export type Link = {
  render?: (link: Link) => React.ReactNode;
  icon: LucideIcon;
  label: string;
  href: string;
  disabled?: boolean;
};

export type LayoutProps = {
  links: Link[];
  children: React.ReactNode;
  navbarButtonMenus: NavButtonType[];
  showNotifications?: boolean;
  title?: string;
};

export const Layout = ({
  links,
  children,
  navbarButtonMenus,
  showNotifications = true,
  title,
}: LayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profile = useQuery(api.profile.getProfile);
  const prevPathnameRef = useRef(pathname);
  const t = useTranslations();

  const isAuthPage = pathname === "/auth";

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setTimeout(() => setIsMobileMenuOpen(false), 0);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  if (isAuthPage) {
    return <div className="h-screen w-full">{children}</div>;
  }

  return (
    <div className="flex flex-row h-screen w-full bg-white overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={`${
          isExpanded ? "w-64" : "w-20"
        } bg-white border-r border-border transition-all duration-300 ease-in-out flex-col hidden lg:flex`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isExpanded ? <Logo text={true} /> : <Logo text={false} />}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <TooltipProvider delayDuration={0}>
            <ul className="space-y-1">
              {links.map((item, idx) => {
                const isActive = pathname === item.href;
                if (item.render) return item.render(item);
                return (
                  <li key={idx} className="relative">
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
                            alt={profile.name || "User"}
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white border-r border-border z-50 flex flex-col lg:hidden"
            >
              {/* Mobile Menu Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <Logo text={true} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 py-4 px-2 overflow-y-auto">
                <ul className="space-y-1">
                  {links.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={idx} className="relative">
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                        )}
                        <Button
                          variant="ghost"
                          className={`w-full justify-start h-11 transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                              : "hover:bg-secondary hover:text-secondary-foreground"
                          }`}
                          asChild
                        >
                          <a href={item.href}>
                            <item.icon className="mr-3 h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                          </a>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Mobile User Section */}
              <div className="p-4 border-t border-border">
                <div
                  onClick={() => {
                    router.push("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                >
                  {profile === undefined ? (
                    <>
                      <div className="h-9 w-9 shrink-0 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-24" />
                        <div className="h-3 bg-muted rounded animate-pulse w-32" />
                      </div>
                    </>
                  ) : profile === null ? (
                    <>
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          G
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {t("components.user.guest")}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t("components.user.notLoggedIn")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-9 w-9 shrink-0">
                        {profile.image && (
                          <AvatarImage
                            src={profile.image}
                            alt={profile.name || "User"}
                          />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(profile.name, profile.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {profile.name || t("components.user.user")}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile.email || t("components.user.noEmail")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
              {title || t("nav.dashboard")}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell visible={showNotifications} />
            {showNotifications && (
              <div className="w-px h-6 bg-border hidden sm:block" />
            )}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-3">
              {navbarButtonMenus.map((menu, idx) => (
                <Button key={idx} size="sm" {...menu}>
                  {menu.children}
                </Button>
              ))}
            </div>
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
