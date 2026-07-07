import type { ReactNode } from "react";

import { IconPhone, IconSend } from "@/components/ui/icons";
import { telegramUrl } from "@/lib/players";
import { cn } from "@/lib/utils";

export function ContactChips({
  telegram,
  phone,
  className,
}: {
  telegram?: string | null;
  phone?: string | null;
  className?: string;
}) {
  if (!telegram && !phone) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {telegram && (
        <Chip href={telegramUrl(telegram)} external icon={<IconSend size={14} />}>
          @{telegram}
        </Chip>
      )}
      {phone && (
        <Chip href={`tel:${phone.replace(/[^\d+]/g, "")}`} icon={<IconPhone size={14} />}>
          {phone}
        </Chip>
      )}
    </div>
  );
}

function Chip({
  href,
  external,
  icon,
  children,
}: {
  href: string;
  external?: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-xs font-bold text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg"
    >
      <span className="text-primary">{icon}</span>
      {children}
    </a>
  );
}
