import { DocLayout } from "@/modules/docs/components/doc-layout";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocLayout>{children}</DocLayout>;
}
