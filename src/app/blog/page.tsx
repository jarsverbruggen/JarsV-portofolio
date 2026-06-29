import { Column, Grid, Heading, Meta, Schema } from "@once-ui-system/core";
import { Mailchimp } from "@/components";
import Post from "@/components/blog/Post";
import { SeriesCard } from "@/components/blog/SeriesCard";
import { buildBlogEntries, type BlogEntry } from "@/components/blog/series";
import { getPosts } from "@/utils/utils";
import { baseURL, blog, person } from "@/resources";

// Render one blog entry: a series collapses into a playlist card; a standalone
// post uses the same card styles as the original layout (featured / grid / text).
function renderEntry(entry: BlogEntry, variant: "featured" | "grid" | "text") {
  if (entry.type === "series") {
    return (
      <SeriesCard
        key={`series-${entry.name}`}
        name={entry.name}
        cover={entry.cover}
        parts={entry.parts}
      />
    );
  }
  return (
    <Post
      key={entry.post.slug}
      post={entry.post}
      thumbnail={variant !== "text"}
      direction={variant === "grid" ? "column" : undefined}
    />
  );
}

export async function generateMetadata() {
  return Meta.generate({
    title: blog.title,
    description: blog.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(blog.title)}`,
    path: blog.path,
  });
}

export default function Blog() {
  const entries = buildBlogEntries(getPosts(["src", "app", "blog", "posts"]));
  const featured = entries[0];
  const middle = entries.slice(1, 3);
  const earlier = entries.slice(3);

  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(blog.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/blog`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
        {blog.title}
      </Heading>
      <Column fillWidth flex={1} gap="40">
        {featured && renderEntry(featured, "featured")}
        {middle.length > 0 && (
          <Grid columns="2" s={{ columns: 1 }} fillWidth gap="16">
            {middle.map((entry) => renderEntry(entry, "grid"))}
          </Grid>
        )}
        <Mailchimp marginBottom="l" />
        {earlier.length > 0 && (
          <>
            <Heading as="h2" variant="heading-strong-xl" marginLeft="l">
              Earlier posts
            </Heading>
            <Grid columns="2" s={{ columns: 1 }} fillWidth gap="16">
              {earlier.map((entry) => renderEntry(entry, "text"))}
            </Grid>
          </>
        )}
      </Column>
    </Column>
  );
}
