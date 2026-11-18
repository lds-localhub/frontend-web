import { useInfiniteQuery } from "@tanstack/react-query";
import { api, toQueryString } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { Page, Review } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loading } from "@/components/ui/Loading";
import { Stars } from "@/components/ui/Stars";
import { formatDate } from "@/utils/format";
import styles from "./ProfileReviews.module.css";

// O protótipo mostra 4 avaliações de início; cada clique em «Ver mais» junta mais 4
const PAGE_SIZE = 4;

type Props = { professionalProfileId: number };

// Cartão das avaliações de um Prestador, da mais recente para a mais antiga, carregadas por partes
export function ProfileReviews({ professionalProfileId }: Props) {
  const reviews = useInfiniteQuery({
    queryKey: queryKeys.profiles.reviews(professionalProfileId, { pageSize: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      api<Page<Review>>(
        `/profiles/${professionalProfileId}/reviews?${toQueryString({ page: pageParam, pageSize: PAGE_SIZE })}`,
      ), // E15
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  });

  if (reviews.isPending) {
    return <Loading />;
  }

  if (reviews.isError) {
    return (
      <ErrorState
        error={reviews.error}
        onRetry={() => reviews.refetch()}
        retrying={reviews.isFetching}
      />
    );
  }

  const items = reviews.data.pages.flatMap((p) => p.items);
  const remaining = reviews.data.pages[0].total - items.length;

  return (
    <Card>
      <h2>Avaliações</h2>
      {items.length === 0 ? (
        <EmptyState>Ainda não tem avaliações.</EmptyState>
      ) : (
        <ul className={styles.list}>
          {items.map((review) => (
            <li key={review.reviewId} className={styles.review}>
              <p className={styles.author}>
                <Stars value={review.rating} />
                <span>
                  <strong>{review.clientName}</strong> · {formatDate(review.creationDate)}
                </span>
              </p>
              <p className={review.comment ? undefined : styles.noComment}>
                {review.comment ? `«${review.comment}»` : "(sem comentário)"}
              </p>
            </li>
          ))}
        </ul>
      )}
      {reviews.hasNextPage && (
        <Button
          variant="secondary"
          onClick={() => reviews.fetchNextPage()}
          disabled={reviews.isFetchingNextPage}
        >
          Ver mais avaliações ({remaining})
        </Button>
      )}
    </Card>
  );
}
