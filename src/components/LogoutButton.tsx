"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { describe } from "node:test";
import { useRouter } from "next/navigation";
import { logOutAction } from "@/actions/users";

const LogoutButton = () => {
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    const { errorMessage } = await logOutAction();

    if (!errorMessage) {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        variant: "success",
      });
      router.push("/");
    } else {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setLoading(false);
    console.log("Logging out...");
  };

  return (
    <Button
      className="w-24"
      variant="outline"
      disabled={loading}
      onClick={handleLogout}
    >
      {loading ? <Loader2 className="animate-spin" /> : "Log Out"}
    </Button>
  );
};

export default LogoutButton;
