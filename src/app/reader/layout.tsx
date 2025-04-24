import ReaderHeader from "@/components/ReaderHeader";

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ReaderHeader />
      <main className="flex flex-1 flex-col px-4 pt-10 xl:px-8">
        {children}
      </main>
    </div>
  );
}
