"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ContactGateNotice } from "@/components/features/contact-gate";
import { EventForm } from "@/components/features/event-form";
import { PageHeader } from "@/components/common/page-header";
import { IconArrowLeft } from "@/components/ui/icons";
import { toast } from "@/components/ui/toast";
import { useHasContact } from "@/hooks/useHasContact";
import { eventHref } from "@/lib/links";

export default function NewGamePage() {
  const router = useRouter();
  const hasContact = useHasContact();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href="/games"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        Все игры
      </Link>

      <PageHeader
        title="Новая игра"
        description="Опубликуйте игру — заявки игроков придут вам на подтверждение."
      />

      {hasContact === false ? (
        <ContactGateNotice text="Чтобы создать игру, добавьте контакт — участники должны иметь возможность с вами связаться." />
      ) : (
        <EventForm
          kind="game"
          onSaved={(event) => {
            toast.success("Игра создана");
            router.push(eventHref(event));
          }}
        />
      )}
    </div>
  );
}
