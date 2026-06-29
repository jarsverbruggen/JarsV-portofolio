"use client";

import { use } from "react";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <ProjectEditor slug={slug} />;
}
