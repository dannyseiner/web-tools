"use client";

import {
  Home,
  Settings,
  BarChart3,
  MessageSquare,
  Building2,
  CodeXml,
  Book,
} from "lucide-react";
import { Layout, Link, NavButtonType } from "@/modules/core/components/layout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const getMainNavLinks = (labels: {
  dashboard: string;
  organizations: string;
  analytics: string;
  messages: string;
  docs: string;
  settings: string;
}): Link[] => [
  { icon: Home, label: labels.dashboard, href: "/" },
  { icon: Building2, label: labels.organizations, href: "/organizations" },
  { icon: CodeXml, label: labels.docs, href: "/docs" },
];

export const MainLayout = ({
  children,
  showNotifications = true,
}: {
  children: React.ReactNode;
  showNotifications?: boolean;
}) => {
  const t = useTranslations();
  const { push } = useRouter();

  const navbarButtonMenus: NavButtonType[] = [
    {
      className: "bg-primary hover:bg-primary/90 text-primary-foreground",
      onClick: () => push("/docs"),
      children: (
        <>
          <Book className="mr-2 h-4 w-4" />
          {t("nav.docs")}
        </>
      ),
    },
  ];

  return (
    <Layout
      links={getMainNavLinks({
        dashboard: t("nav.dashboard"),
        organizations: t("nav.organizations"),
        analytics: t("nav.analytics"),
        messages: t("nav.messages"),
        docs: t("nav.docs"),
        settings: t("nav.settings"),
      })}
      navbarButtonMenus={navbarButtonMenus}
      showNotifications={showNotifications}
    >
      {children}
    </Layout>
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
