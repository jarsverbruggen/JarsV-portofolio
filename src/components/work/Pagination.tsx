import { Button, Row, Text } from "@once-ui-system/core";

interface PaginationProps {
  current: number;
  totalPages: number;
  basePath: string;
}

/**
 * Simple link-based pagination (Prev / page indicator / Next). Server-rendered,
 * needs no client JS — each control is a normal link to ?page=N.
 */
export function Pagination({ current, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = current > 1;
  const hasNext = current < totalPages;

  return (
    <Row fillWidth horizontal="center" vertical="center" gap="12" paddingX="l" marginTop="24" marginBottom="40">
      <Button
        size="s"
        variant="secondary"
        disabled={!hasPrev}
        href={hasPrev ? `${basePath}?page=${current - 1}` : undefined}
      >
        ← Sebelumnya
      </Button>
      <Text variant="label-default-s" onBackground="neutral-weak">
        Halaman {current} dari {totalPages}
      </Text>
      <Button
        size="s"
        variant="secondary"
        disabled={!hasNext}
        href={hasNext ? `${basePath}?page=${current + 1}` : undefined}
      >
        Berikutnya →
      </Button>
    </Row>
  );
}
