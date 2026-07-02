"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTournament, useUpdateTournament } from "@/hooks/useTournaments";
import { useVenues } from "@/hooks/useVenues";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import {
  GENDERS,
  GENDER_LABELS,
  SKILL_LABELS,
  SKILL_LEVELS,
  TOURNAMENT_STATUSES,
  TOURNAMENT_STATUS_LABELS,
  type Gender,
  type SkillLevel,
  type TournamentStatus,
} from "@/lib/enums";
import { handleApiError } from "@/lib/errors/handle";
import { fieldErrors } from "@/lib/errors/messages";
import { isoToMoscowDate, isoToMoscowTime, moscowIso } from "@/lib/schemas/event";
import { buildTournamentFormSchema, type TournamentFormValues } from "@/lib/schemas/tournament";
import type { TournamentRead } from "@/types/api";

const SERVER_TO_FIELD: Record<string, keyof TournamentFormValues> = {
  title: "title",
  description: "description",
  venue_id: "venue_id",
  starts_at: "start_date",
  ends_at: "end_time",
  registration_deadline: "reg_time",
  max_participants: "max_participants",
  skill_level_min: "skill_min",
  skill_level_max: "skill_max",
  rating_min: "rating_min",
  rating_max: "rating_max",
  gender_restriction: "gender_restriction",
  entry_fee: "entry_fee",
  external_url: "external_url",
  status: "status",
};

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);
const numOr = (v: string) => (v.trim() ? Number(v.trim()) : undefined);

export function TournamentForm({
  initial,
  onSaved,
}: {
  initial?: TournamentRead;
  onSaved: (tournament: TournamentRead) => void;
}) {
  const isEdit = initial != null;
  const create = useCreateTournament();
  const update = useUpdateTournament(initial?.id ?? 0, initial?.slug ?? "");
  const venuesQuery = useVenues({ city_id: SMOLENSK_CITY_ID, limit: 100, sort: "name" });
  const venues = useMemo(() => venuesQuery.data?.items ?? [], [venuesQuery.data]);

  const schema = useMemo(() => buildTournamentFormSchema({ requireFuture: !isEdit }), [isEdit]);

  const {
    register: field,
    handleSubmit,
    setError,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TournamentFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      venue_id: initial?.venue_id ? String(initial.venue_id) : "",
      start_date: initial ? isoToMoscowDate(initial.starts_at) : "",
      start_time: initial ? isoToMoscowTime(initial.starts_at) : "",
      end_date: initial?.ends_at ? isoToMoscowDate(initial.ends_at) : "",
      end_time: initial?.ends_at ? isoToMoscowTime(initial.ends_at) : "",
      reg_date: initial?.registration_deadline ? isoToMoscowDate(initial.registration_deadline) : "",
      reg_time: initial?.registration_deadline ? isoToMoscowTime(initial.registration_deadline) : "",
      max_participants: initial?.max_participants ? String(initial.max_participants) : "",
      entry_fee: initial?.entry_fee ? String(Number(initial.entry_fee)) : "",
      skill_min: initial?.skill_level_min ?? "",
      skill_max: initial?.skill_level_max ?? "",
      rating_min: initial?.rating_min != null ? String(initial.rating_min) : "",
      rating_max: initial?.rating_max != null ? String(initial.rating_max) : "",
      gender_restriction: initial?.gender_restriction ?? "",
      external_url: initial?.external_url ?? "",
      status: initial?.status ?? "announced",
    },
  });

  const venueId = watch("venue_id");
  const selectedVenue = venueId ? venues.find((v) => String(v.id) === venueId) : undefined;
  const minDate = isEdit ? undefined : isoToMoscowDate(new Date().toISOString());

  const onSubmit: SubmitHandler<TournamentFormValues> = async (values) => {
    const startsAt = moscowIso(values.start_date, values.start_time);
    const endsAt =
      values.end_date && values.end_time ? moscowIso(values.end_date, values.end_time) : undefined;
    const deadline =
      values.reg_date && values.reg_time ? moscowIso(values.reg_date, values.reg_time) : undefined;
    const venueIdNum = values.venue_id ? Number(values.venue_id) : undefined;
    const maxParticipants = numOr(values.max_participants);
    const entryFee = values.entry_fee.trim() ? values.entry_fee.trim().replace(",", ".") : undefined;
    const skillMin = values.skill_min ? (values.skill_min as SkillLevel) : undefined;
    const skillMax = values.skill_max ? (values.skill_max as SkillLevel) : undefined;
    const ratingMin = numOr(values.rating_min);
    const ratingMax = numOr(values.rating_max);
    const gender = values.gender_restriction ? (values.gender_restriction as Gender) : undefined;
    const externalUrl = clean(values.external_url);

    try {
      const saved = isEdit
        ? await update.mutateAsync({
            title: values.title.trim(),
            description: clean(values.description) ?? null,
            venue_id: venueIdNum ?? null,
            status: (values.status || initial!.status) as TournamentStatus,
            starts_at: startsAt,
            ends_at: endsAt ?? null,
            registration_deadline: deadline ?? null,
            max_participants: maxParticipants ?? null,
            skill_level_min: skillMin ?? null,
            skill_level_max: skillMax ?? null,
            rating_min: ratingMin ?? null,
            rating_max: ratingMax ?? null,
            gender_restriction: gender ?? null,
            entry_fee: entryFee ?? null,
            external_url: externalUrl ?? null,
          })
        : await create.mutateAsync({
            city_id: SMOLENSK_CITY_ID,
            title: values.title.trim(),
            description: clean(values.description),
            venue_id: venueIdNum,
            starts_at: startsAt,
            ends_at: endsAt,
            registration_deadline: deadline,
            max_participants: maxParticipants,
            skill_level_min: skillMin,
            skill_level_max: skillMax,
            rating_min: ratingMin,
            rating_max: ratingMax,
            gender_restriction: gender,
            entry_fee: entryFee,
            external_url: externalUrl,
          });
      onSaved(saved);
    } catch (err) {
      const fe = fieldErrors(err);
      const mapped = Object.entries(fe)
        .map(([f, message]) => [SERVER_TO_FIELD[f], message] as const)
        .filter((e): e is [keyof TournamentFormValues, string] => !!e[0]);
      if (mapped.length) {
        for (const [f, message] of mapped) setError(f, { message });
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
        <Field label="Название" error={errors.title?.message}>
          <Input
            type="text"
            placeholder="Например: Открытый турнир Смоленска"
            aria-invalid={!!errors.title}
            {...field("title")}
          />
        </Field>

        <Field label="Положение о турнире" error={errors.description?.message} hint="Необязательно">
          <Textarea
            rows={5}
            placeholder="Формат, сетка, регламент, призы, контакты организатора…"
            {...field("description")}
          />
        </Field>

        <Field
          label="Зал"
          error={errors.venue_id?.message}
          hint={selectedVenue ? selectedVenue.address : "Необязательно"}
        >
          <Select {...field("venue_id")}>
            <option value="">Не указан</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Дата начала" error={errors.start_date?.message}>
            <Input type="date" min={minDate} aria-invalid={!!errors.start_date} {...field("start_date")} />
          </Field>
          <Field label="Время начала" error={errors.start_time?.message}>
            <Input type="time" aria-invalid={!!errors.start_time} {...field("start_time")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Дата окончания" error={errors.end_date?.message} hint="Необязательно">
            <Input type="date" min={minDate} aria-invalid={!!errors.end_date} {...field("end_date")} />
          </Field>
          <Field label="Время окончания" error={errors.end_time?.message} hint="Необязательно">
            <Input type="time" aria-invalid={!!errors.end_time} {...field("end_time")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Дедлайн регистрации — дата" error={errors.reg_date?.message} hint="Необязательно">
            <Input type="date" min={minDate} aria-invalid={!!errors.reg_date} {...field("reg_date")} />
          </Field>
          <Field label="Дедлайн — время" error={errors.reg_time?.message} hint="Необязательно">
            <Input type="time" aria-invalid={!!errors.reg_time} {...field("reg_time")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Максимум участников"
            error={errors.max_participants?.message}
            hint="Пусто — без ограничения."
          >
            <Input
              type="number"
              inputMode="numeric"
              min={2}
              max={4096}
              placeholder="Без ограничения"
              aria-invalid={!!errors.max_participants}
              {...field("max_participants")}
            />
          </Field>
          <Field label="Взнос, ₽" error={errors.entry_fee?.message} hint="Пусто — бесплатно.">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Бесплатно"
              aria-invalid={!!errors.entry_fee}
              {...field("entry_fee")}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Уровень от" error={errors.skill_min?.message}>
            <Select {...field("skill_min")}>
              <option value="">Любой</option>
              {SKILL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {SKILL_LABELS[l]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Уровень до" error={errors.skill_max?.message}>
            <Select {...field("skill_max")}>
              <option value="">Любой</option>
              {SKILL_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {SKILL_LABELS[l]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Рейтинг от" error={errors.rating_min?.message} hint="Пусто — без нижней границы.">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={32767}
              placeholder="Любой"
              aria-invalid={!!errors.rating_min}
              {...field("rating_min")}
            />
          </Field>
          <Field label="Рейтинг до" error={errors.rating_max?.message} hint="Пусто — без верхней границы.">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={32767}
              placeholder="Любой"
              aria-invalid={!!errors.rating_max}
              {...field("rating_max")}
            />
          </Field>
        </div>

        <Field label="Пол участников" error={errors.gender_restriction?.message}>
          <Select {...field("gender_restriction")}>
            <option value="">Любой</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Ссылка на турнир"
          error={errors.external_url?.message}
          hint="Необязательно — сайт или страница регистрации."
        >
          <Input
            type="url"
            inputMode="url"
            placeholder="https://…"
            aria-invalid={!!errors.external_url}
            {...field("external_url")}
          />
        </Field>

        {isEdit && (
          <Field label="Статус" error={errors.status?.message} hint="Откройте регистрацию, чтобы игроки могли записаться.">
            <Select {...field("status")}>
              {TOURNAMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TOURNAMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="sm:self-start sm:px-10">
          {isEdit ? "Сохранить изменения" : "Создать турнир"}
        </Button>
      </div>
    </form>
  );
}
