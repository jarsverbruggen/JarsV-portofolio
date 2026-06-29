import { Column, Row, Media, Text, SmartLink } from "@once-ui-system/core";
import type { BlogPost } from "./series";

/**
 * "Playlist" card for a blog series: one cover + the ordered list of parts,
 * each linking to its post. Used on the /blog listing instead of showing every
 * part as a separate card.
 */
export function SeriesCard({
  name,
  cover,
  parts,
}: {
  name: string;
  cover?: string;
  parts: BlogPost[];
}) {
  const firstHref = `/blog/${parts[0]?.slug ?? ""}`;

  return (
    <Column
      fillWidth
      border="neutral-alpha-weak"
      background="surface"
      radius="l"
      overflow="hidden"
    >
      {cover && (
        <SmartLink href={firstHref} unstyled fillWidth>
          <Media
            src={cover}
            alt={name}
            aspectRatio="16 / 9"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </SmartLink>
      )}
      <Column fillWidth padding="24" gap="16">
        <Column gap="4">
          <Text variant="label-strong-s" onBackground="brand-weak">
            SERI · {parts.length} bagian
          </Text>
          <SmartLink href={firstHref} unstyled>
            <Text variant="heading-strong-l" wrap="balance">
              {name}
            </Text>
          </SmartLink>
        </Column>
        <Column fillWidth gap="4">
          {parts.map((part, index) => (
            <SmartLink key={part.slug} href={`/blog/${part.slug}`} unstyled fillWidth>
              <Row
                fillWidth
                gap="12"
                paddingY="12"
                paddingX="16"
                radius="m"
                vertical="center"
                background="neutral-alpha-weak"
                border="neutral-alpha-weak"
              >
                <Text variant="label-strong-m" onBackground="neutral-weak">
                  {index + 1}
                </Text>
                <Text variant="body-default-m" onBackground="neutral-strong">
                  {part.metadata.title}
                </Text>
              </Row>
            </SmartLink>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
