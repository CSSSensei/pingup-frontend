import Link from "next/link";
import type { ReactNode } from "react";

import { IconArrowLeft } from "@/components/ui/icons";

export function DetailTopBar({
  backHref,
  backLabel,
  action,
}: {
  backHref: string;
  backLabel: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        {backLabel}
      </Link>
      {action}
    </div>
  );
}
