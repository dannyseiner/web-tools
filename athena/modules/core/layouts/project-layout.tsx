"use client";

import {
  FolderKanban,
  ListTodo,
  Users,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
} from "lucide-react";
import {
  Layout,
  Link as NavLink,
  NavButtonType,
} from "@/modules/core/components/layout";
import { useParams } from "next/navigation";

const getProjectNavLinks = (orgId: string, projectId: string): NavLink[] => [
  {
    icon: FolderKanban,
    label: "Overview",
    href: `/organizations/${orgId}/projects/${projectId}`,
  },
  {
    icon: ListTodo,
    label: "Tasks",
    href: `/organizations/${orgId}/projects/${projectId}/tasks`,
  },
  {
    icon: Users,
    label: "Team",
    href: `/organizations/${orgId}/projects/${projectId}/team`,
  },
  {
    icon: FileText,
    label: "Documents",
    href: `/organizations/${orgId}/projects/${projectId}/documents`,
  },
  {
    icon: Calendar,
    label: "Timeline",
    href: `/organizations/${orgId}/projects/${projectId}/timeline`,
  },
  {
    icon: BarChart3,
    label: "Reports",
    href: `/organizations/${orgId}/projects/${projectId}/reports`,
  },
  {
    icon: Settings,
    label: "Settings",
    href: `/organizations/${orgId}/projects/${projectId}/settings`,
  },
];

const navbarButtonMenus: NavButtonType[] = [
  {
    children: (
      <>
        <MessageSquare className="mr-2 h-4 w-4" />
        Support
      </>
    ),
    variant: "outline",
    className: "border-border hover:bg-secondary",
  },
];

export const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const orgId = params?.id as string;
  const projectId = params?.projectId as string;

  return (
    <Layout
      links={getProjectNavLinks(orgId || "default", projectId || "default")}
      navbarButtonMenus={navbarButtonMenus}
    >
      {children}
    </Layout>
  );
};

export function exportWithProjectLayout(Page: React.ComponentType) {
  return function WrappedPage() {
    return (
      <ProjectLayout>
        <Page />
      </ProjectLayout>
    );
  };
}
