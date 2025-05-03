import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { PermissionProvider } from "@/providers/PermissionProvider";

export const metadata: Metadata = {
  title: "Library Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PermissionProvider>{children}</PermissionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
