"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconArrowLeft } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreatePartnerRequest } from "@/hooks/usePartners";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import {
  EVENT_TYPES,
  EVENT_TYPE_LABELS,
  GENDERS,
  GENDER_LABELS,
  SKILL_LABELS,
  SKILL_LEVELS,
  type EventType,
  type Gender,
  type SkillLevel,
} from "@/lib/enums";
import { handleApiError } from "@/lib/errors/handle";
import { fieldErrors } from "@/lib/errors/messages";
import { createPartnerRequestSchema, type CreatePartnerRequestValues } from "@/lib/schemas/partner";

const clean = (v: string | undefined) => (v ? v : undefined);

export default function NewPartnerRequestPage() {
  const router = useRouter();
  const create = useCreatePartnerRequest();
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<CreatePartnerRequestValues>({
    resolver: zodResolver(createPartnerRequestSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      desired_skill_min: "",
      desired_skill_max: "",
      desired_gender: "",
      event_type: "",
    },
  });

  const onSubmit: SubmitHandler<CreatePartnerRequestValues> = async (values) => {
    try {
      const created = await create.mutateAsync({
        city_id: SMOLENSK_CITY_ID,
        title: values.title,
        description: clean(values.description),
        desired_skill_min: clean(values.desired_skill_min) as SkillLevel | undefined,
        desired_skill_max: clean(values.desired_skill_max) as SkillLevel | undefined,
        desired_gender: clean(values.desired_gender) as Gender | undefined,
        event_type: clean(values.event_type) as EventType | undefined,
      });
      toast.success("Объявление опубликовано");
      router.push(`/partners/${created.id}`);
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) {
        for (const [field, message] of Object.entries(fe)) {
          setError(field as keyof CreatePartnerRequestValues, { message });
        }
        setFocus(Object.keys(fe)[0] as keyof CreatePartnerRequestValues);
      } else {
        handleApiError(err);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href="/partners"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        Все объявления
      </Link>

      <PageHeader
        title="Новое объявление"
        description="Расскажите, какого напарника ищете — отклики придут в уведомления."
      />

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6"
      >
        <div className="flex flex-col gap-4">
          <Field label="Заголовок" error={errors.title?.message}>
            <Input
              type="text"
              placeholder="Например: Ищу спарринг-партнёра 2–3 раза в неделю"
              invalid={!!errors.title}
              {...register("title")}
            />
          </Field>

          <Field label="Описание" error={errors.description?.message}>
            <Textarea
              rows={5}
              maxLength={4000}
              placeholder="Уровень, стиль игры, удобное время и зал — что важно напарнику."
              invalid={!!errors.description}
              {...register("description")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Уровень: от" error={errors.desired_skill_min?.message}>
              <Select {...register("desired_skill_min")}>
                <option value="">Любой</option>
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {SKILL_LABELS[lvl]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Уровень: до" error={errors.desired_skill_max?.message}>
              <Select {...register("desired_skill_max")}>
                <option value="">Любой</option>
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {SKILL_LABELS[lvl]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Кого ищете" error={errors.desired_gender?.message}>
              <Select {...register("desired_gender")}>
                <option value="">Любой пол</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {GENDER_LABELS[g]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Формат игры" error={errors.event_type?.message}>
              <Select {...register("event_type")}>
                <option value="">Любой</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 self-start px-8">
            Опубликовать
          </Button>
        </div>
      </form>
    </div>
  );
}
