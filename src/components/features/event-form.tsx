"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { ChipSelect } from "@/components/features/filters/filter-bar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEvent, useUpdateEvent } from "@/hooks/useEvents";
import { useCoaches } from "@/hooks/useProfiles";
import { useVenues } from "@/hooks/useVenues";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import {
  EVENT_FORMAT_LABELS,
  EVENT_TYPE_LABELS,
  GENDERS,
  GENDER_LABELS,
  SKILL_LABELS,
  SKILL_LEVELS,
  type Gender,
  type SkillLevel,
} from "@/lib/enums";
import { handleApiError } from "@/lib/errors/handle";
import { fieldErrors } from "@/lib/errors/messages";
import {
  buildEventFormSchema,
  GAME_FORMATS,
  isoToMoscowDate,
  isoToMoscowTime,
  moscowIso,
  TRAINING_TYPES,
  type EventFormValues,
} from "@/lib/schemas/event";
import type { EventRead } from "@/types/api";

export type EventFormKind = "game" | "training";

const SERVER_TO_FIELD: Record<string, keyof EventFormValues> = {
  title: "title",
  description: "description",
  venue_id: "venue_id",
  location_text: "location_text",
  coach_id: "coach_id",
  starts_at: "date",
  ends_at: "time_end",
  max_participants: "max_participants",
  min_skill_level: "min_skill",
  max_skill_level: "max_skill",
  gender_restriction: "gender_restriction",
  price: "price",
};

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export function EventForm({
  kind,
  initial,
  onSaved,
}: {
  kind: EventFormKind;
  initial?: EventRead;
  onSaved: (event: EventRead) => void;
}) {
  const isEdit = initial != null;
  const create = useCreateEvent();
  const update = useUpdateEvent(initial?.id ?? 0);
  const venuesQuery = useVenues({ city_id: SMOLENSK_CITY_ID, limit: 100, sort: "name" });
  const coachesQuery = useCoaches(kind === "training" && !isEdit);
  const venues = useMemo(() => venuesQuery.data?.items ?? [], [venuesQuery.data]);
  const coaches = coachesQuery.data?.items ?? [];

  const schema = useMemo(() => buildEventFormSchema({ requireFuture: !isEdit }), [isEdit]);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      training_type:
        initial && initial.event_type !== "game"
          ? (initial.event_type as (typeof TRAINING_TYPES)[number])
          : "group_training",
      game_format: initial?.event_format === "doubles" ? "doubles" : "singles",
      coach_id: initial?.coach_id ? String(initial.coach_id) : "",
      venue_id: initial?.venue_id ? String(initial.venue_id) : "",
      location_text: initial?.location_text ?? "",
      date: initial ? isoToMoscowDate(initial.starts_at) : "",
      time_start: initial ? isoToMoscowTime(initial.starts_at) : "",
      time_end: initial?.ends_at ? isoToMoscowTime(initial.ends_at) : "",
      max_participants: initial?.max_participants ? String(initial.max_participants) : "",
      min_skill: initial?.min_skill_level ?? "",
      max_skill: initial?.max_skill_level ?? "",
      gender_restriction: initial?.gender_restriction ?? "",
      price: initial?.price ? String(Number(initial.price)) : "",
      is_public: initial?.is_public ?? true,
    },
  });

  const trainingType = watch("training_type");
  const gameFormat = watch("game_format");
  const venueId = watch("venue_id");
  const isPublic = watch("is_public");
  const selectedVenue = venueId ? venues.find((v) => String(v.id) === venueId) : undefined;

  // Дата «сегодня» — по Москве, как и весь ввод времени.
  const minDate = isEdit ? undefined : isoToMoscowDate(new Date().toISOString());

  const onSubmit: SubmitHandler<EventFormValues> = async (values) => {
    const venueIdNum = values.venue_id ? Number(values.venue_id) : undefined;
    const venue = venues.find((v) => v.id === venueIdNum);
    // Карточки/деталь показывают location_text — при выборе зала дублируем его адрес.
    const locationText = venue ? `${venue.name} · ${venue.address}` : values.location_text.trim();
    const startsAt = moscowIso(values.date, values.time_start);
    const endsAt = values.time_end ? moscowIso(values.date, values.time_end) : undefined;
    const maxParticipants = values.max_participants.trim()
      ? Number(values.max_participants)
      : undefined;
    const price = values.price.trim() ? values.price.trim().replace(",", ".") : undefined;
    const minSkill = values.min_skill ? (values.min_skill as SkillLevel) : undefined;
    const maxSkill = values.max_skill ? (values.max_skill as SkillLevel) : undefined;
    const gender = values.gender_restriction
      ? (values.gender_restriction as Gender)
      : undefined;

    try {
      const saved = isEdit
        ? await update.mutateAsync({
            title: values.title.trim(),
            description: clean(values.description) ?? null,
            venue_id: venueIdNum ?? null,
            location_text: locationText || null,
            starts_at: startsAt,
            ends_at: endsAt ?? null,
            max_participants: maxParticipants ?? null,
            min_skill_level: minSkill ?? null,
            max_skill_level: maxSkill ?? null,
            gender_restriction: gender ?? null,
            price: price ?? null,
            is_public: values.is_public,
          })
        : await create.mutateAsync({
            city_id: SMOLENSK_CITY_ID,
            event_type: kind === "game" ? "game" : values.training_type,
            event_format:
              kind === "game"
                ? values.game_format
                : values.coach_id
                  ? "coaching"
                  : values.training_type === "group_training"
                    ? "group"
                    : "singles",
            title: values.title.trim(),
            description: clean(values.description),
            venue_id: venueIdNum,
            location_text: locationText || undefined,
            coach_id: values.coach_id ? Number(values.coach_id) : undefined,
            starts_at: startsAt,
            ends_at: endsAt,
            max_participants: maxParticipants,
            min_skill_level: minSkill,
            max_skill_level: maxSkill,
            gender_restriction: gender,
            price,
            is_public: values.is_public,
          });
      onSaved(saved);
    } catch (err) {
      const fe = fieldErrors(err);
      const mapped = Object.entries(fe)
        .map(([field, message]) => [SERVER_TO_FIELD[field], message] as const)
        .filter((e): e is [keyof EventFormValues, string] => !!e[0]);
      if (mapped.length) {
        for (const [field, message] of mapped) setError(field, { message });
        setFocus(mapped[0][0]);
      } else {
        handleApiError(err);
      }
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-col gap-4">
        {kind === "training" && !isEdit && (
          <Field label="Тип тренировки">
            <ChipSelect
              ariaLabel="Тип тренировки"
              options={TRAINING_TYPES.map((t) => ({ value: t, label: EVENT_TYPE_LABELS[t] }))}
              value={trainingType}
              onChange={(v) =>
                setValue("training_type", v as (typeof TRAINING_TYPES)[number], {
                  shouldValidate: true,
                })
              }
            />
          </Field>
        )}

        {kind === "game" && !isEdit && (
          <Field label="Формат игры">
            <ChipSelect
              ariaLabel="Формат игры"
              options={GAME_FORMATS.map((f) => ({ value: f, label: EVENT_FORMAT_LABELS[f] }))}
              value={gameFormat}
              onChange={(v) =>
                setValue("game_format", v as (typeof GAME_FORMATS)[number], {
                  shouldValidate: true,
                })
              }
            />
          </Field>
        )}

        <Field label="Название" error={errors.title?.message}>
          <Input
            type="text"
            placeholder={
              kind === "game" ? "Например: Вечерняя игра, ищу соперника" : "Например: Тренировка для начинающих"
            }
            aria-invalid={!!errors.title}
            {...register("title")}
          />
        </Field>

        <Field label="Описание" error={errors.description?.message} hint="Необязательно">
          <Textarea
            rows={4}
            placeholder="Детали: формат встречи, инвентарь, кому подойдёт…"
            {...register("description")}
          />
        </Field>

        {kind === "training" && !isEdit && (
          <Field
            label="Тренер"
            error={errors.coach_id?.message}
            hint={
              coaches.length === 0 && coachesQuery.isSuccess
                ? "В каталоге пока нет тренеров — тренировка будет без тренера."
                : "С тренером событие получит формат «С тренером»."
            }
          >
            <Select {...register("coach_id")}>
              <option value="">Без тренера</option>
              {coaches.map((c) => (
                <option key={c.user_id} value={c.user_id}>
                  {c.display_name}
                  {c.current_rating != null ? ` · рейтинг ${c.current_rating}` : ""}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {kind === "training" && isEdit && initial?.coach && (
          <p className="text-[13px] font-medium text-muted">
            Тренер: <span className="font-semibold text-fg-2">{initial.coach.display_name}</span> —
            поменять тренера после создания нельзя.
          </p>
        )}

        <Field
          label="Зал"
          error={errors.venue_id?.message}
          hint={selectedVenue ? selectedVenue.address : undefined}
        >
          <Select {...register("venue_id")}>
            <option value="">Другое место — укажу адрес</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>

        {!venueId && (
          <Field label="Место встречи" error={errors.location_text?.message}>
            <Input
              type="text"
              placeholder="Адрес или описание места"
              aria-invalid={!!errors.location_text}
              {...register("location_text")}
            />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Дата" error={errors.date?.message}>
            <Input type="date" min={minDate} aria-invalid={!!errors.date} {...register("date")} />
          </Field>
          <Field label="Начало" error={errors.time_start?.message}>
            <Input type="time" aria-invalid={!!errors.time_start} {...register("time_start")} />
          </Field>
          <Field label="Окончание" error={errors.time_end?.message} hint="Необязательно">
            <Input type="time" aria-invalid={!!errors.time_end} {...register("time_end")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Максимум участников"
            error={errors.max_participants?.message}
            hint="Считая вас. Пусто — без ограничения."
          >
            <Input
              type="number"
              inputMode="numeric"
              min={2}
              max={1000}
              placeholder="Без ограничения"
              aria-invalid={!!errors.max_participants}
              {...register("max_participants")}
            />
          </Field>
          <Field label="Цена, ₽" error={errors.price?.message} hint="Пусто — бесплатно.">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Бесплатно"
              aria-invalid={!!errors.price}
              {...register("price")}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Уровень от" error={errors.min_skill?.message}>
            <Select {...register("min_skill")}>
              <option value="">Любой</option>
              {SKILL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {SKILL_LABELS[l]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Уровень до" error={errors.max_skill?.message}>
            <Select {...register("max_skill")}>
              <option value="">Любой</option>
              {SKILL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {SKILL_LABELS[l]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Пол участников" error={errors.gender_restriction?.message}>
            <Select {...register("gender_restriction")}>
              <option value="">Любой</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded border border-border bg-surface-2 p-3.5">
          <Switch checked={isPublic} onCheckedChange={(v) => setValue("is_public", v)} />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-fg">Публичное событие</span>
            <span className="block text-[13px] font-medium text-muted">
              Видно всем в каталоге. Непубличное — только по прямой ссылке.
            </span>
          </span>
        </label>

        <Button type="submit" size="lg" loading={isSubmitting} className="sm:self-start sm:px-10">
          {isEdit
            ? "Сохранить изменения"
            : kind === "game"
              ? "Создать игру"
              : "Создать тренировку"}
        </Button>
      </div>
    </form>
  );
}
