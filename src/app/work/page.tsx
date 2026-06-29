import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { Pagination } from "@/components/work/Pagination";
import { getPosts } from "@/utils/utils";

// How many projects to show per page on /work.
const PAGE_SIZE = 6;

export async function generateMetadata() {
  return Meta.generate({
    title: work.title,
    description: work.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(work.title)}`,
    path: work.path,
  });
}

export default async function Work({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const total = getPosts(["src", "app", "work", "projects"]).length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const requested = Number.parseInt(pageParam ?? "1", 10);
  const page = Math.min(Math.max(Number.isNaN(requested) ? 1 : requested, 1), totalPages);

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = page * PAGE_SIZE;

  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        image={`/api/og/generate?title=${encodeURIComponent(work.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {work.title}
      </Heading>
      <Projects range={[start, end]} pinnedFirst />
      <Pagination current={page} totalPages={totalPages} basePath={work.path} />
    </Column>
  );
}
