"use client";

import { exportWithProjectLayout } from "@/modules/core/layouts/project-layout";

function ProjectDetailPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Project Detail</h1>
      <p>Project overview page</p>
    </div>
  );
}

export default exportWithProjectLayout(ProjectDetailPage);
