"use client";

import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { exportWithProjectLayout } from "@/modules/core/layouts/project-layout";
import { ListsOverview } from "@/modules/lists/components/lists-overview";

function ListsPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ListsOverview projectId={projectId} />
    </div>
  );
}

export default exportWithProjectLayout(ListsPage);
