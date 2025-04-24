import { shadow } from "@/styles/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import DarkModeToggle from "./DarkModeToggle";
import LogoutButton from "./LogoutButton";
import { SidebarTrigger } from "./ui/sidebar";

const StaffHeader = () => {
  const user = 1;

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="rounded-md hover:bg-muted"></SidebarTrigger>
        <Link href="/" className="text-xl font-bold tracking-wide">
          Library Management
        </Link>
      </div>

      <div className="flex gap-4">
        <DarkModeToggle />

        {user ? (
          <LogoutButton />
        ) : (
          <>
            <Button asChild>
              <Link href="/sign-up" className="hidden sm:block">
                Sign Up
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default StaffHeader;
