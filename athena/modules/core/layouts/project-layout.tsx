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
  Languages,
} from "lucide-react";
import {
  Layout,
  Link as NavLink,
  NavButtonType,
} from "@/modules/core/components/layout";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const orgId = params?.id as string;
  const projectId = params?.projectId as string;
  const t = useTranslations();

  const getProjectNavLinks = (orgId: string, projectId: string): NavLink[] => [
    {
      icon: FolderKanban,
      label: t("components.projectLayout.overview"),
      href: `/organizations/${orgId}/projects/${projectId}`,
    },
    {
      icon: Languages,
      label: t("components.projectLayout.translations"),
      href: `/organizations/${orgId}/projects/${projectId}/translations`,
    },
    {
      icon: ListTodo,
      label: t("components.projectLayout.tasks"),
      href: `/organizations/${orgId}/projects/${projectId}/tasks`,
    },
    {
      icon: Users,
      label: t("components.projectLayout.team"),
      href: `/organizations/${orgId}/projects/${projectId}/team`,
    },
    {
      icon: FileText,
      label: t("components.projectLayout.documents"),
      href: `/organizations/${orgId}/projects/${projectId}/documents`,
    },
    {
      icon: Calendar,
      label: t("components.projectLayout.timeline"),
      href: `/organizations/${orgId}/projects/${projectId}/timeline`,
    },
    {
      icon: BarChart3,
      label: t("components.projectLayout.reports"),
      href: `/organizations/${orgId}/projects/${projectId}/reports`,
    },
    {
      icon: Settings,
      label: t("components.projectLayout.settings"),
      href: `/organizations/${orgId}/projects/${projectId}/settings`,
    },
  ];

  const navbarButtonMenus: NavButtonType[] = [
    {
      children: (
        <>
          <MessageSquare className="mr-2 h-4 w-4" />
          {t("components.projectLayout.support")}
        </>
      ),
      variant: "outline",
      className: "border-border hover:bg-secondary",
    },
  ];

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
