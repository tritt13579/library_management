// import StaffHeader from "@/components/StaffHeader";

// export default function StaffLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex min-h-screen w-full flex-col">
//       <StaffHeader />
//       <main className="container flex flex-1 flex-col px-4 pt-10 xl:px-8">
//         {children}
//       </main>
//     </div>
//   );
// }

import { AppSidebar } from "@/components/AppSidebar";
import StaffHeader from "@/components/StaffHeader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          <StaffHeader />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
