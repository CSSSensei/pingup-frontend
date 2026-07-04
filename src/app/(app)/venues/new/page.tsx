import Link from "next/link";

import { VenueForm } from "@/components/features/venue-form";
import { PageHeader } from "@/components/common/page-header";
import { IconArrowLeft } from "@/components/ui/icons";

export default function NewVenuePage() {
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

      <VenueForm />
    </div>
  );
}
