"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reviewsApi } from "@/lib/api/endpoints/reviews";
import { handleApiError } from "@/lib/errors/handle";
import { qk } from "@/lib/queryKeys";
import type { ReviewCreatePayload, ReviewFilterParams, ReviewUpdatePayload } from "@/types/api";

export function useReviews(filter: ReviewFilterParams) {
  return useQuery({
    queryKey: qk.reviews(filter),
    queryFn: () => reviewsApi.list(filter),
    enabled: filter.target_id != null && Number.isFinite(filter.target_id),
  });
}

// Отзыв на зал меняет денорм rating_avg/reviews_count → инвалидируем и залы.
function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["reviews"] });
  qc.invalidateQueries({ queryKey: ["venue"] });
  qc.invalidateQueries({ queryKey: ["venues"] });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewCreatePayload) => reviewsApi.create(body),
    onError: handleApiError,
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateReview(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewUpdatePayload) => reviewsApi.update(id, body),
    onError: handleApiError,
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteReview(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => reviewsApi.remove(id),
    onError: handleApiError,
    onSuccess: () => invalidate(qc),
  });
}
