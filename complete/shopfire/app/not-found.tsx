"use client";

import { Button } from "@/components/ui/button";
import { NavigationRoutes } from "@/lib/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-800">
      <div className="text-center flex flex-col items-center justify-center gap-6 leading-none">
        <h2 className="text-3xl font-bold">Page Not Found</h2>
        <p className="text-gray-500">
          <span className="font-mono">{pathname}</span> does not exist
        </p>
        <Link href={NavigationRoutes.HOME}>
          <Button>Go to Home</Button>
        </Link>
      </div>
    </div>
  );
}
