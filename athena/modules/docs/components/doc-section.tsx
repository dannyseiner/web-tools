interface DocSectionProps {
  title: string;
  children: React.ReactNode;
  id?: string;
}

export function DocSection({ title, children, id }: DocSectionProps) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">
        {title}
      </h2>
      <div className="space-y-4 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
