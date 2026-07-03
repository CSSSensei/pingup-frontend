"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateReport } from "@/hooks/useReports";
import { handleApiError, isEmailGate } from "@/lib/errors/handle";
import { fieldErrors } from "@/lib/errors/messages";
import { REPORT_TARGET_LABELS, type ReportTargetType } from "@/lib/enums";
import { reportSchema, type ReportFormValues } from "@/lib/schemas/report";

export function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
}: {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: number;
}) {
  const create = useCreateReport();

  // Монтируется с key на открытие → defaultValues свежие, reset не нужен.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    mode: "onTouched",
    defaultValues: { reason: "" },
  });

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      { target_type: targetType, target_id: targetId, reason: values.reason.trim() },
      {
        onSuccess: () => {
          toast.success("Жалоба отправлена — модераторы рассмотрят её.");
          onClose();
        },
        onError: (err) => {
          const fe = fieldErrors(err);
          if (fe.reason) {
            setError("reason", { type: "server", message: fe.reason });
            return;
          }
          handleApiError(err);
          // Гейт неподтверждённого email открывает свою модалку — закрываем эту.
          if (isEmailGate(err)) onClose();
        },
      },
    );
  });

  return (
    <Modal open={open} onClose={onClose} title={`Пожаловаться · ${REPORT_TARGET_LABELS[targetType]}`}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <p className="text-sm text-muted">
          Опишите, что не так. Жалоба анонимна для нарушителя и попадёт к модераторам.
        </p>
        <Field label="Причина" error={errors.reason?.message}>
          <Textarea
            rows={4}
            maxLength={2000}
            autoFocus
            placeholder="Например: спам, оскорбления, недостоверная информация"
            invalid={!!errors.reason}
            {...register("reason")}
          />
        </Field>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={create.isPending}
          >
            Отмена
          </Button>
          <Button type="submit" variant="danger" fullWidth loading={create.isPending}>
            Отправить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
