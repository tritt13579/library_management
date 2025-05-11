// // app/unauthorized/page.tsx
// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";

// export default function UnauthorizedPage() {
//   const router = useRouter();

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
//         <h1 className="mb-4 text-3xl font-bold text-red-600">
//           Không có quyền truy cập
//         </h1>
//         <div className="mb-6 rounded-md bg-red-50 p-4">
//           <p className="mb-4 text-gray-700">
//             Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với
//             tài khoản phù hợp hoặc liên hệ với quản trị viên để được cấp quyền.
//           </p>
//         </div>
//         <div className="flex flex-col justify-center gap-4 sm:flex-row">
//           <Button
//             onClick={() => router.back()}
//             className="bg-gray-500 text-white hover:bg-gray-600"
//           >
//             Quay lại
//           </Button>
//           <Button
//             onClick={() => router.push("/login")}
//             className="bg-blue-600 text-white hover:bg-blue-700"
//           >
//             Đăng nhập
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Không có quyền truy cập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="text-sm text-muted-foreground">
              Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với
              tài khoản phù hợp hoặc liên hệ với quản trị viên để được cấp
              quyền.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-center sm:space-x-2 sm:space-y-0">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
