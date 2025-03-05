"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/lib/api/users/use-user";
import { useCartStore } from "@/lib/cart-store";
import { getIsPublicRoute, NavigationRoutes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingCart,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { CartSheetContent } from "./cart-sheet-content";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { title: "Home", href: NavigationRoutes.HOME, icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: "Account Info", href: NavigationRoutes.PROFILE, icon: <Building2 className="h-5 w-5" /> },
  { title: "Support", href: NavigationRoutes.SUPPORT, icon: <HelpCircle className="h-5 w-5" /> },
];

interface MainNavProps {}

export function MainNav({}: MainNavProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const isPublicRoute = getIsPublicRoute(pathname);
  const isProfileSelected = pathname === "/profile";
  const { data: userData } = useUser();
  const { items } = useCartStore();
  const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
          className={cn("h-10", !isExpanded && "hidden")}
          width={191}
          height={0}
        />
      );
    }
    return <Image src="/images/logo-square.svg" alt="SHOPFIRE" className="h-full" width={52} height={52} />;
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300 relative sticky top-0",
        isExpanded ? "w-52" : "w-[60px]"
      )}
    >
      <div className={cn("flex items-center border-b p-2")}>
        <Link href={NavigationRoutes.HOME} className="flex items-center gap-2 w-full">
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

      <nav className="flex-1 space-y-1 p-1">
        <div className="flex flex-grow border-b pb-1 w-full">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  !isExpanded && "justify-center"
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                {isExpanded && (
                  <div className="flex items-center justify-between w-full">
                    <div>My Cart</div>
                    <div className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">{cartCount}</div>
                  </div>
                )}
              </Button>
            </SheetTrigger>
            <CartSheetContent
              onClose={() => {
                closeSheet();
              }}
            />
          </Sheet>
        </div>
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
