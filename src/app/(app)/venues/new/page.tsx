"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { MapPicker } from "@/components/maps/map-picker";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconArrowLeft, IconCamera, IconX } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useAddVenuePhoto, useCreateVenue } from "@/hooks/useVenues";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { handleApiError } from "@/lib/errors/handle";
import { fieldErrors } from "@/lib/errors/messages";
import {
  createVenueSchema,
  parseCoord,
  validateVenuePhotoFile,
  VENUE_PHOTOS_MAX,
  type CreateVenueValues,
} from "@/lib/schemas/venue";

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

// Серверные имена полей → поля формы (working_hours приходит как JSONB-поле).
const SERVER_TO_FIELD: Record<string, keyof CreateVenueValues> = {
  name: "name",
  address: "address",
  description: "description",
  lat: "lat",
  lng: "lng",
  tables_count: "tables_count",
  phone: "phone",
  website: "website",
  working_hours: "working_hours_text",
  price_info: "price_info",
};

export default function NewVenuePage() {
  const router = useRouter();
  const create = useCreateVenue();
  const addPhoto = useAddVenuePhoto();
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateVenueValues>({
    resolver: zodResolver(createVenueSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      address: "",
      description: "",
      lat: "",
      lng: "",
      tables_count: "",
      phone: "",
      website: "",
      working_hours_text: "",
      price_info: "",
    },
  });

  const latValue = watch("lat");
  const lngValue = watch("lng");
  const point = useMemo(() => {
    const lat = parseCoord(latValue ?? "");
    const lng = parseCoord(lngValue ?? "");
    return lat != null && lng != null ? { lat, lng } : null;
  }, [latValue, lngValue]);

  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...photos];
    for (const file of Array.from(list)) {
      if (next.length >= VENUE_PHOTOS_MAX) {
        toast.error(`Не больше ${VENUE_PHOTOS_MAX} фото`);
        break;
      }
      const problem = validateVenuePhotoFile(file);
      if (problem) {
        toast.error(`${file.name}: ${problem}`);
        continue;
      }
      next.push(file);
    }
    setPhotos(next);
  }

  const onSubmit: SubmitHandler<CreateVenueValues> = async (values) => {
    try {
      const created = await create.mutateAsync({
        city_id: SMOLENSK_CITY_ID,
        name: values.name,
        address: values.address,
        lat: parseCoord(values.lat)!,
        lng: parseCoord(values.lng)!,
        description: clean(values.description),
        tables_count: values.tables_count?.trim() ? Number(values.tables_count) : undefined,
        phone: clean(values.phone),
        website: clean(values.website),
        working_hours: values.working_hours_text?.trim()
          ? { text: values.working_hours_text.trim() }
          : undefined,
        price_info: clean(values.price_info),
      });

      // Фото — best-effort: неудача не блокирует созданный зал.
      let failed = 0;
      for (const [i, file] of photos.entries()) {
        try {
          await addPhoto.mutateAsync({
            venueId: created.id,
            file,
            sortOrder: i,
            isCover: i === 0,
          });
        } catch {
          failed += 1;
        }
      }
      if (failed > 0) toast.error(`Не удалось загрузить фото: ${failed} из ${photos.length}`);

      toast.success("Зал добавлен в каталог");
      router.push(`/venues/${created.slug}`);
    } catch (err) {
      const fe = fieldErrors(err);
      const mapped = Object.entries(fe)
        .map(([field, message]) => [SERVER_TO_FIELD[field], message] as const)
        .filter((e): e is [keyof CreateVenueValues, string] => !!e[0]);
      if (mapped.length) {
        for (const [field, message] of mapped) setError(field, { message });
        setFocus(mapped[0][0]);
      } else {
        handleApiError(err);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href="/venues"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        Все залы
      </Link>

      <PageHeader
        title="Новый зал"
        description="Добавьте площадку, которой не хватает в каталоге — после проверки модератором она получит отметку «Проверен»."
      />

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6"
      >
        <div className="flex flex-col gap-4">
          <Field label="Название" error={errors.name?.message}>
            <Input
              type="text"
              placeholder="Например: СК «Юбилейный»"
              invalid={!!errors.name}
              {...register("name")}
            />
          </Field>

          <Field label="Адрес" error={errors.address?.message}>
            <Input
              type="text"
              placeholder="Улица, дом"
              invalid={!!errors.address}
              {...register("address")}
            />
          </Field>

          <Field
            label="Точка на карте"
            hint="Кликните по карте — координаты подставятся сами."
            error={errors.lat?.message ?? errors.lng?.message}
          >
            <div className="space-y-2.5">
              <MapPicker
                value={point}
                onChange={(lat, lng) => {
                  setValue("lat", lat.toFixed(6), { shouldValidate: true, shouldTouch: true });
                  setValue("lng", lng.toFixed(6), { shouldValidate: true, shouldTouch: true });
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Широта, напр. 54.7818"
                  aria-label="Широта"
                  invalid={!!errors.lat}
                  {...register("lat")}
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Долгота, напр. 32.0401"
                  aria-label="Долгота"
                  invalid={!!errors.lng}
                  {...register("lng")}
                />
              </div>
            </div>
          </Field>

          <Field label="Описание" error={errors.description?.message}>
            <Textarea
              rows={4}
              maxLength={4000}
              placeholder="Что за площадка, какое покрытие, есть ли инвентарь напрокат."
              invalid={!!errors.description}
              {...register("description")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Количество столов" error={errors.tables_count?.message}>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={500}
                placeholder="напр. 6"
                invalid={!!errors.tables_count}
                {...register("tables_count")}
              />
            </Field>

            <Field label="Телефон" error={errors.phone?.message}>
              <Input
                type="tel"
                placeholder="+7 (4812) 55-21-03"
                invalid={!!errors.phone}
                {...register("phone")}
              />
            </Field>

            <Field label="Сайт" error={errors.website?.message}>
              <Input
                type="text"
                inputMode="url"
                placeholder="club-smolensk.ru"
                invalid={!!errors.website}
                {...register("website")}
              />
            </Field>

            <Field label="График работы" error={errors.working_hours_text?.message}>
              <Input
                type="text"
                placeholder="Пн–Вс 09:00–22:00"
                invalid={!!errors.working_hours_text}
                {...register("working_hours_text")}
              />
            </Field>
          </div>

          <Field label="Цены" error={errors.price_info?.message}>
            <Textarea
              rows={2}
              maxLength={2000}
              placeholder="от 300 ₽/час, аренда ракеток — 100 ₽"
              invalid={!!errors.price_info}
              {...register("price_info")}
            />
          </Field>

          <Field
            label="Фото"
            hint={`До ${VENUE_PHOTOS_MAX} фото (JPEG/PNG/WebP, до 8 МБ). Первое станет обложкой.`}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              {previews.map((url, i) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Фото ${i + 1}`}
                    className="h-20 w-28 rounded border border-border object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-pill bg-surface/90 px-1.5 py-0.5 text-[10px] font-bold text-fg-2">
                      Обложка
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Убрать фото ${i + 1}`}
                    onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 rounded-full border border-border bg-surface p-0.5 text-muted shadow-card hover:text-danger"
                  >
                    <IconX size={13} />
                  </button>
                </div>
              ))}
              {photos.length < VENUE_PHOTOS_MAX && (
                <label className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-border text-muted transition-colors hover:border-border-strong hover:text-fg-2">
                  <IconCamera size={20} />
                  <span className="text-[11px] font-bold">Добавить</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </Field>

          <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 self-start px-8">
            Добавить зал
          </Button>
        </div>
      </form>
    </div>
  );
}
