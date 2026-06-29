import { Column, Row, Text, SmartLink } from "@once-ui-system/core";
import { getSeries, type BlogPost } from "./series";

/**
 * In-article series navigator: lists every part of the current post's series
 * (active one highlighted) plus previous/next links. Renders nothing when the
 * post is standalone or the series has a single part.
 */
export function SeriesNav({ posts, currentSlug }: { posts: BlogPost[]; currentSlug: string }) {
  const current = posts.find((p) => p.slug === currentSlug);
  const seriesName = (current?.metadata.series || "").trim();
  if (!seriesName) return null;

  const parts = getSeries(posts, seriesName);
  if (parts.length < 2) return null;

  const index = parts.findIndex((p) => p.slug === currentSlug);
  const prev = index > 0 ? parts[index - 1] : null;
  const next = index < parts.length - 1 ? parts[index + 1] : null;

  return (
    <Column
      fillWidth
      border="neutral-alpha-weak"
      background="surface"
      radius="l"
      padding="20"
      gap="16"
    >
      <Text variant="label-strong-s" onBackground="brand-weak">
        Seri · {seriesName}
      </Text>

      <Column fillWidth gap="4">
        {parts.map((part, i) => {
          const active = part.slug === currentSlug;
          if (active) {
            return (
              <Row
                key={part.slug}
                fillWidth
                gap="12"
                paddingY="12"
                paddingX="16"
                radius="m"
                vertical="center"
                background="brand-alpha-weak"
                border="brand-alpha-medium"
              >
                <Text variant="label-strong-m" onBackground="brand-strong">
                  {i + 1}
                </Text>
                <Text variant="body-strong-m" onBackground="brand-strong">
                  {part.metadata.title}
                </Text>
              </Row>
            );
          }
          return (
            <SmartLink key={part.slug} href={`/blog/${part.slug}`} unstyled fillWidth>
              <Row
                fillWidth
                gap="12"
                paddingY="12"
                paddingX="16"
                radius="m"
                vertical="center"
                background="neutral-alpha-weak"
              >
                <Text variant="label-strong-m" onBackground="neutral-weak">
                  {i + 1}
                </Text>
                <Text variant="body-default-m" onBackground="neutral-strong">
                  {part.metadata.title}
                </Text>
              </Row>
            </SmartLink>
          );
        })}
      </Column>

      <Row fillWidth horizontal="between" gap="8" vertical="center">
        {prev ? (
          <SmartLink href={`/blog/${prev.slug}`}>
            <Text variant="label-default-s">‹ Sebelumnya</Text>
          </SmartLink>
        ) : (
          <span />
        )}
        {next ? (
          <SmartLink href={`/blog/${next.slug}`}>
            <Text variant="label-default-s">Berikutnya ›</Text>
          </SmartLink>
        ) : (
          <span />
        )}
      </Row>
    </Column>
  );
}
