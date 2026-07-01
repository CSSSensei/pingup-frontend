import { EmptyState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        title="Скоро"
        description={description ?? "Этот раздел ещё в разработке — мы скоро его откроем."}
      />
    </>
  );
}
