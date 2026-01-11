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
  NavLink,
  NavbarButton,
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

const navbarButtons: NavbarButton[] = [
  {
    icon: MessageSquare,
    label: "Support",
    variant: "outline",
  },
];

export const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const orgId = params?.id as string;
  const projectId = params?.projectId as string;

  return (
    <Layout
      links={getProjectNavLinks(orgId || "default", projectId || "default")}
      navbarButtons={navbarButtons}
      headerTitle="Project"
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
