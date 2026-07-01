import { MyProfileView } from "@/components/features/my-profile-view";

export const metadata = { title: "Профиль" };

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <MyProfileView />
    </div>
  );
}
