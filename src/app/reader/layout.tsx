import { getUser } from "@/auth/server";
import ReaderHeader from "@/components/ReaderHeader";

export default async function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <div className="flex min-h-screen flex-col">
      <ReaderHeader user={user} />
      <main className="flex flex-1 flex-col px-4 pt-10 xl:px-8">
        {children}
      </main>
    </div>
  );
}
