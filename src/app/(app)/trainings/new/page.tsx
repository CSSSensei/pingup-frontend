"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EventForm } from "@/components/features/event-form";
import { PageHeader } from "@/components/common/page-header";
import { IconArrowLeft } from "@/components/ui/icons";
import { toast } from "@/components/ui/toast";
import { eventHref } from "@/lib/links";

export default function NewTrainingPage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href="/trainings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        Все тренировки
      </Link>

      <PageHeader
        title="Новая тренировка"
        description="Групповая тренировка или личный спарринг — с тренером или без."
      />

      <EventForm
        kind="training"
        onSaved={(event) => {
          toast.success("Тренировка создана");
          router.push(eventHref(event));
        }}
      />
    </div>
  );
}
