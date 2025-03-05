"use client";

import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/lib/cart-store";
import { useProducts } from "@/lib/hooks/useProducts";
import { NavigationRoutes } from "@/lib/navigation";
import Link from "next/link";
import { useMemo } from "react";

interface CartSheetContentProps {
  onClose: () => void;
}

export function CartSheetContent({ onClose }: CartSheetContentProps) {
  const { items, removeFromCart, updateQuantity } = useCartStore();
  const { data: products } = useProducts();

  // Get full product details for cart items
  const cartItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      product: products?.find((p) => p.id === item.productId),
    }));
  }, [items, products]);

  // Calculate totals using product data
  const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.product?.price || "0") * item.quantity, 0);

  return (
    <SheetContent className="w-full sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>Shopping Cart</SheetTitle>
      </SheetHeader>
      <div className="h-full py-4">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">Your cart is empty</div>
        ) : (
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product?.name}</h4>
                  <p className="text-sm text-muted-foreground">${item.product?.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                    +
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.productId)}>
                  Remove
                </Button>
              </div>
            ))}
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href={NavigationRoutes.CHECKOUT} onClick={onClose}>
                  Checkout
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </SheetContent>
  );
}
