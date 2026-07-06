"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

const EDIT_HREF = "/profile/edit";

export function ContactGateButton({ label = "Добавьте контакт для участия" }: { label?: string }) {
  return (
    <Link href={EDIT_HREF} className="w-full sm:w-auto">
      <Button size="lg" fullWidth className="sm:w-auto sm:px-8">
        {label}
      </Button>
    </Link>
  );
}

export function ContactGateNotice({
  text = "Без контакта другие игроки не смогут с вами связаться. Добавьте Telegram или телефон в профиле.",
}: {
  text?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-6 text-center">
      <p className="text-[15px] font-semibold text-fg-2">{text}</p>
      <div className="mt-4 flex justify-center">
        <LinkButton href={EDIT_HREF}>Добавить контакт</LinkButton>
      </div>
    </div>
  );
}
