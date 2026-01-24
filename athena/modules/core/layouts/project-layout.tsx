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
  Building2,
} from "lucide-react";
import {
  Layout,
  Link as NavLink,
  NavButtonType,
} from "@/modules/core/components/layout";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { Skeleton } from "@/modules/core/ui/skeleton";

const OrganizationHeaderSkeleton = () => (
  <div className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg border border-border/50">
    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

const OrganizationHeader = ({
  name,
  image,
  onClick,
}: {
  name?: string | null;
  image?: string | null;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg border border-border/50 hover:bg-accent/70 transition-colors cursor-pointer"
  >
    {image ? (
      <Image
        src={image}
        alt={name || "Organization"}
        width={32}
        height={32}
        className="w-8 h-8 rounded-lg object-cover border border-border shadow-sm bg-white"
      />
    ) : (
      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-sm">
        <Building2 className="w-4 h-4 text-white" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-foreground truncate">
        {name || "Organization"}
      </p>
    </div>
  </div>
);

export const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.id as string;
  const projectId = params?.projectId as string;
  const t = useTranslations();

  // Fetch organization data
  const organization = useQuery(
    api.organizations.getOrganization,
    orgId ? { organizationId: orgId as Id<"organizations"> } : "skip",
  );

  const isLoading = organization === undefined;

  const getProjectNavLinks = (
    orgId: string,
    projectId: string,
    organizationName: string | null | undefined,
    organizationImage: string | null | undefined,
    isLoading: boolean,
  ): NavLink[] => [
    {
      icon: Building2,
      label: organizationName || "Organization",
      href: `/organizations/${orgId}`,
      render: () =>
        isLoading ? (
          <OrganizationHeaderSkeleton />
        ) : (
          <OrganizationHeader
            name={organizationName}
            image={organizationImage}
            onClick={() => router.push(`/organizations/${orgId}`)}
          />
        ),
    },
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
      links={getProjectNavLinks(
        orgId || "default",
        projectId || "default",
        organization?.name ?? null,
        organization?.image ?? null,
        isLoading,
      )}
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
