"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { StarInput } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateReview, useUpdateReview } from "@/hooks/useReviews";
import type { ReviewTargetType } from "@/lib/enums";
import { reviewSchema, type ReviewFormValues } from "@/lib/schemas/review";
import type { ReviewRead } from "@/types/api";

export function ReviewComposer({
  open,
  onClose,
  targetType,
  targetId,
  review,
}: {
  open: boolean;
  onClose: () => void;
  targetType: ReviewTargetType;
  targetId: number;
  review?: ReviewRead;
}) {
  const isEdit = review != null;
  const create = useCreateReview();
  const update = useUpdateReview(review?.id ?? 0);
  const pending = create.isPending || update.isPending;

  // Монтируется с key на открытие → defaultValues всегда свежие, reset не нужен.
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    mode: "onTouched",
    defaultValues: { rating: review?.rating ?? 0, comment: review?.comment ?? "" },
  });

  const onSubmit = handleSubmit((values) => {
    const comment = values.comment?.trim() || null;
    const done = () => {
      toast.success(isEdit ? "Отзыв обновлён" : "Спасибо за отзыв!");
      onClose();
    };
    if (isEdit) {
      update.mutate({ rating: values.rating, comment }, { onSuccess: done });
    } else {
      create.mutate(
        { target_type: targetType, target_id: targetId, rating: values.rating, comment },
        { onSuccess: done },
      );
    }
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Изменить отзыв" : "Оставить отзыв"}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <Field label="Оценка" error={errors.rating?.message}>
              <StarInput value={field.value} onChange={field.onChange} />
            </Field>
          )}
        />
        <Field label="Комментарий" hint="Необязательно" error={errors.comment?.message}>
          <Textarea
            rows={4}
            maxLength={2000}
            placeholder="Чем понравилось или что можно улучшить"
            invalid={!!errors.comment}
            {...register("comment")}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose} disabled={pending}>
            Отмена
          </Button>
          <Button type="submit" fullWidth loading={pending}>
            {isEdit ? "Сохранить" : "Отправить"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
