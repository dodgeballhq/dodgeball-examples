"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUser } from "@/lib/api/users/use-user";
import { getIsPublicRoute, NavigationRoutes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { title: "Home", href: NavigationRoutes.HOME, icon: <LayoutDashboard className="h-5 w-5" /> },
  // { title: "Add Money", href: NavigationRoutes.NEW_TRANSACTION, icon: <PlusCircle className="h-5 w-5" /> },
  { title: "Account Info", href: NavigationRoutes.PROFILE, icon: <Building2 className="h-5 w-5" /> },
  // { title: "Cards", href: "/cards", icon: <CreditCard className="h-5 w-5" /> },
  // { title: "Statements", href: "/statements", icon: <FileText className="h-5 w-5" /> },
  // { title: "Reserves", href: "/reserves", icon: <Wallet className="h-5 w-5" /> },
  // { title: "Invoices", href: "/invoices", icon: <Receipt className="h-5 w-5" /> },
  // { title: "Apps", href: "/apps", icon: <Apps className="h-5 w-5" /> },,
  { title: "Support", href: NavigationRoutes.SUPPORT, icon: <HelpCircle className="h-5 w-5" /> },
];

interface MainNavProps {}

export function MainNav({}: MainNavProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const isPublicRoute = getIsPublicRoute(pathname);
  const isProfileSelected = pathname === "/profile";
  const { data: userData } = useUser();
  if (!userData?.session) {
    return null;
  }

  if (isPublicRoute) {
    return null;
  }

  const renderLogo = () => {
    if (isExpanded) {
      return (
        <Image
          src="/images/logo-wide.svg"
          alt="SHOPFIRE"
          className={cn("h-8", !isExpanded && "hidden")}
          width={150}
          height={0}
        />
      );
    }
    return <Image src="/images/logo-square.svg" alt="SHOPFIRE" className="h-8" width={32} height={32} />;
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300 relative",
        isExpanded ? "w-52" : "w-[60px]"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href={NavigationRoutes.HOME} className="flex items-center gap-2">
          {renderLogo()}
        </Link>
      </div>

      <Button
        variant="secondary"
        size="icon"
        className="absolute -right-8 top-2 translate-x-1/2 rounded-full border bg-background"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
      </Button>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              !isExpanded && "justify-center"
            )}
          >
            {item.icon}
            {isExpanded && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      {userData?.user && (
        <div className={cn("border-t", !isExpanded && "flex flex-col items-center")}>
          <Popover>
            <PopoverTrigger asChild>
              <div
                className={cn("mb-4 flex items-center gap-3 h-full rounded-lg p-2", isProfileSelected && "bg-gray-50")}
              >
                <Avatar className="cursor-pointer hover:opacity-80 shrink-0">
                  <AvatarImage src={""} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                {isExpanded && (
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{userData?.user?.fullName}</span>
                    <span className="text-xs text-muted-foreground truncate">{userData?.user?.email}</span>
                  </div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col gap-2">
                {!isExpanded && (
                  <div className="mb-2 flex flex-col">
                    <span className="font-medium truncate">{userData?.user?.fullName}</span>
                    <span className="text-xs text-muted-foreground truncate">{userData?.user?.email}</span>
                  </div>
                )}
                <Link href="/profile" className="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="truncate">View Profile</span>
                </Link>
                <Link href={NavigationRoutes.LOGOUT} className="flex items-center gap-2 rounded-md p-2 hover:bg-accent">
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span className="truncate">Logout</span>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
