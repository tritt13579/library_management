"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useTransition } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/actions/users";
import { usePermissions } from "@/providers/PermissionProvider";

const AuthForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { fetchPermissions } = usePermissions();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const { errorMessage, role } = await loginAction(email, password);

      if (!errorMessage) {
        if (role === "staff") {
          await fetchPermissions();
        }

        toast({
          title: "Logged in",
          description: "You have successfully logged in.",
          variant: "success",
        });

        if (role === "reader") {
          router.replace("/reader");
        } else if (role === "staff") {
          router.replace("/staff");
        } else {
          router.replace("/");
        }
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            required
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password"
            type="password"
            required
            disabled={isPending}
          />
        </div>
      </CardContent>
      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : "Login"}
        </Button>
      </CardFooter>
    </form>
  );
};

export default AuthForm;
