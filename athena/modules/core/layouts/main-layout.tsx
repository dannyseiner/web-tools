"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/core/ui/avatar";
import { Button } from "@/modules/core/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/modules/core/ui/tooltip";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Users, label: "Team", href: "/team" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

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
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer ${
                    !isExpanded && "justify-center"
                  }`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src="https://avatar.vercel.sh/user" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  {isExpanded && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        John Doe
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        john@example.com
                      </p>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {!isExpanded && (
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">
                      john@example.com
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
                <span className="text-xs">Collapse</span>
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
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Support
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </div>
        </header>

        {/* Main Content with Dim Background */}
        <main className="flex-1 overflow-y-auto bg-background-dim p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
