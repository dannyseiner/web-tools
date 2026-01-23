"use client";

import {
  ListTodo,
  Users,
  Settings,
  MessageSquare,
  Building2,
} from "lucide-react";
import { Layout, Link, NavButtonType } from "@/modules/core/components/layout";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { Skeleton } from "@/modules/core/ui/skeleton";
import { useTranslations } from "next-intl";

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
  overviewLabel,
}: {
  name?: string | null;
  image?: string | null;
  overviewLabel: string;
}) => (
  <div className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg border border-border/50">
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
      <p className="text-xs text-muted-foreground">{overviewLabel}</p>
    </div>
  </div>
);

const getOrganizationNavLinks = (
  organizationId: string,
  organizationName: string | null | undefined,
  organizationImage: string | null | undefined,
  isLoading: boolean,
  labels: {
    overview: string;
    projects: string;
    members: string;
    settings: string;
  },
): Link[] => [
  {
    icon: Building2,
    label: organizationName || "Organization",
    href: `/organizations/${organizationId}`,
    render: () =>
      isLoading ? (
        <OrganizationHeaderSkeleton />
      ) : (
        <OrganizationHeader
          name={organizationName}
          image={organizationImage}
          overviewLabel={labels.overview}
        />
      ),
  },
  {
    icon: ListTodo,
    label: labels.projects,
    href: `/organizations/${organizationId}/projects`,
  },
  {
    icon: Users,
    label: labels.members,
    href: `/organizations/${organizationId}/members`,
  },
  {
    icon: Settings,
    label: labels.settings,
    href: `/organizations/${organizationId}/settings`,
  },
];

export const OrganizationLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const params = useParams();
  const organizationId = params?.id as string;
  const t = useTranslations();

  // Fetch organization data
  const organization = useQuery(
    api.organizations.getOrganization,
    organizationId
      ? { organizationId: organizationId as Id<"organizations"> }
      : "skip",
  );

  const isLoading = organization === undefined;

  const navbarButtonMenus: NavButtonType[] = [
    {
      children: (
        <>
          <MessageSquare className="mr-2 h-4 w-4" />
          {t("components.organizationLayout.support")}
        </>
      ),
      className: "border-border hover:bg-secondary",
    },
  ];

  return (
    <Layout
      links={getOrganizationNavLinks(
        organizationId || "default",
        organization?.name ?? null,
        organization?.image ?? null,
        isLoading,
        {
          overview: t("components.organizationLayout.overview"),
          projects: t("components.organizationLayout.projects"),
          members: t("components.organizationLayout.members"),
          settings: t("components.organizationLayout.settings"),
        },
      )}
      navbarButtonMenus={navbarButtonMenus}
    >
      {children}
    </Layout>
  );
};

export function exportWithOrganizationLayout(Page: React.ComponentType) {
  return function WrappedPage() {
    return (
      <OrganizationLayout>
        <Page />
      </OrganizationLayout>
    );
  };
}
